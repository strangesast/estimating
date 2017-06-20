import { Commit, Tag, IPerson, Tree } from './models';
import * as sha1 from 'js-sha1';
import { modes } from './modes';
import { indexOf, binToHex, hexToBin, join, parseDec, parseOct } from './bin';

export const encoders = {
  commit: encodeCommit,
  tag: encodeTag,
  tree: encodeTree,
  blob: encodeBlob
}

function encodeCommit({ tree, parents, author, committer, message }: Commit): Uint8Array {
  let str = 'tree ' + tree;
  for (let parent of parents) {
    str += '\nparent ' + parent;
  }
  str += '\nauthor ' + formatPerson(author) +
         '\ncommmitter ' + formatPerson(committer) +
         '\n\n' + message;
  return new TextEncoder().encode(str);
}

function encodeTag({ object, type, tag, tagger, message } : Tag): Uint8Array {
  let str = 'object ' + object + '\ntype ' + type + '\ntag ' + tag + '\ntagger '
    + formatPerson(tagger) + '\n\n' + message;
  return new TextEncoder().encode(str);
}

function formatPerson({ name, email, date }: IPerson): string {
  if (typeof name !== 'string' || typeof email !== 'string' || !(date instanceof Date)) {
    throw new Error('invalid person');
  }
  return safe(name) + ' <' + safe(email) + '> ' + formatDate(date);
}

function formatDate(date: Date): string {
  let seconds: any = Math.floor(date.getTime() / 1000),
      offset: any = date.getTimezoneOffset();
  var neg = '+';
  if (offset <= 0) {
    offset = -offset;
  } else {
    neg = '-';
  }
  offset = neg + two(Math.floor(offset / 60)) + two(offset % 60);
  return seconds + ' ' + offset;
}

function two(num: number): string {
  return (num < 10 ? '0' : '') + num;
}

function safe(string): string {
  return string.replace(/(?:^[\.,:;<>"']+|[\0\n<>]+|[\.,:;<>"']+$)/gm, '');
}

function encodeTree(body: Tree): Uint8Array {
  if (!Array.isArray(body)) {
    throw new TypeError('tree must be an array');
  }
  let encoder = new TextEncoder();
  let tree = body.sort(treeSort).map(({ mode, name, hash }) => {
    let header = encoder.encode(mode.toString(8) + ' ' + name + '\0');
    let content = hexToBin(hash);
    return join(header, content);
  });

  return join(...tree);
}

function treeSort(a, b): number {
  let aa = (a.mode === modes.tree) ? a.name + '/' : a.name;
  let bb = (b.mode === modes.tree) ? b.name + '/' : b.name;
  return aa > bb ? 1 : aa < bb ? -1 : 0;
}

function encodeBlob(body: string | Uint8Array): Uint8Array {
  if (typeof body === 'string') {
    body = new TextEncoder().encode(body);
  }
  if (!(body instanceof Uint8Array)) {
    throw new Error('blobs must be uint8arrays');
  }
  return body;
}

export function frame({ type, body }: { type: string, body: Uint8Array }): Uint8Array {
  var encoder = new TextEncoder();
  var header = encoder.encode(type + ' ' + body.length + '\0');
  return join(header, body);
}

export function decode({ type, body }) {
  let decoder = decoders[type];
  if (!decoder) throw new Error('invalid type');
  return decoder(body);
}

export const decoders = {
  commit: decodeCommit,
  tag: decodeTag,
  tree: decodeTree,
  blob: decodeBlob
}

function decodeCommit(body): Commit {
  var decoder = new TextDecoder(),
      i = 0,
      start,
      key,
      parents = [],
      commit: Commit = { parents } as Commit;

  while (body[i] !== 0x0a) {
    start = i;
    i = body.indexOf(0x20, start);
    if (i < 0) {
      throw new Error('missing space');
    }
    key = decoder.decode(body.slice(start, i++));
    start = i;
    i = body.indexOf(0x0a, start);
    if (i < 0) {
      throw new Error('missing linefeed');
    }
    let value: any = decoder.decode(body.slice(start, i++));
    if (key === 'parent') {
      parents.push(value);
    } else {
      if (key === 'author' || key === 'committer') {
        value = decodePerson(value);
      }
      commit[key] = value;
    }
  }

  i++;
  commit.message = decoder.decode(body.slice(i, body.length));
  return commit;
}

function decodeTag(body) {
  let decoder = new TextDecoder(),
      i = 0,
      start,
      key,
      tag = {};
  while (body[i] !== 0x0a) {
    start = i;
    i = body.indexOf(0x20);
    if (i < 0) {
      throw new Error('missing space');
    }
    key = decoder.decode(body.slice(start, i++));
    start = i;
    i = body.indexOf(0x0a, start);
    if (i < 0) {
      throw new Error('missing linefeed');
    }
    let value: any = decoder.decode(body.slice(start, i++));
    if (key === 'tagger') {
      value = decodePerson(value);
    }
  }
}

function decodePerson(str): IPerson {
  var match = str.match(/^([^<]*) <([^>]*)> ([^ ]*) (.*)$/);
  if (!match) {
    throw new Error('Improperly formatted person string');
  }
  let [ name, email ] = match.slice(1);
  let [ seconds, offset] = match.slice(3).map(s => parseInt(s, 10));
  return { name, email, date: new Date(seconds*1000) };
}

function decodeTree(body) {
  let i = 0,
      length = body.length,
      start,
      mode,
      name,
      hash,
      tree = [],
      decoder = new TextDecoder();
  while (i < length) {
    start = i;
    i = body.indexOf(0x20, start);
    if (i < 0) { throw new SyntaxError("Missing space"); }
    mode = parseOct(body, start, i++);
    start = i;
    i = body.indexOf(0x00, start);
    name = decoder.decode(body.slice(start, i++));
    hash = binToHex(body, i, i += 20);
    tree.push({
      name: name,
      mode: mode,
      hash: hash
    });
  }
  return tree;
}

function decodeBlob(body): Uint8Array {
  return body;
}

export function deframe(buf: Uint8Array): { type: string, body: any } {
  var space = buf.indexOf(0x20);
  if (space < 0) throw new Error('invalid git object buffer');
  var nil = buf.indexOf(0x00, space)
  if (nil < 0) throw new Error('invalid git object buffer');
  var body = buf.slice(nil + 1);
  var size = parseDec(buf, space + 1, nil);
  if (size !== body.length) throw new Error('invalid body length');
  var type = new TextDecoder().decode(buf.slice(0, space));
  return { type, body };
}
