"""
Read the hand-written `data.js` files of the existing demos.

They are JavaScript object literals (`window.BUSINESS = { name: "x", // comment ... };`),
not JSON: keys are unquoted, strings may use single quotes, there are comments and
trailing commas. This small tokenizer turns them into Python values without running
any JavaScript.
"""
import json
import re

_IDENT = re.compile(r"[A-Za-z_$][\w$]*")
_NUMBER = re.compile(r"-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?")


class JSDataError(ValueError):
    pass


class _Parser:
    def __init__(self, text):
        self.s = text
        self.i = 0

    def error(self, msg):
        line = self.s.count("\n", 0, self.i) + 1
        raise JSDataError("%s (line %d)" % (msg, line))

    def skip(self):
        s, n = self.s, len(self.s)
        while self.i < n:
            c = s[self.i]
            if c in " \t\r\n﻿":
                self.i += 1
            elif s.startswith("//", self.i):
                end = s.find("\n", self.i)
                self.i = n if end < 0 else end + 1
            elif s.startswith("/*", self.i):
                end = s.find("*/", self.i + 2)
                if end < 0:
                    self.error("unclosed comment")
                self.i = end + 2
            else:
                break

    def peek(self):
        self.skip()
        return self.s[self.i] if self.i < len(self.s) else ""

    def expect(self, ch):
        if self.peek() != ch:
            self.error("expected %r" % ch)
        self.i += 1

    def value(self):
        c = self.peek()
        if c == "{":
            return self.obj()
        if c == "[":
            return self.arr()
        if c in "\"'`":
            return self.string()
        m = _NUMBER.match(self.s, self.i)
        if m:
            self.i = m.end()
            txt = m.group(0)
            return float(txt) if any(x in txt for x in ".eE") else int(txt)
        m = _IDENT.match(self.s, self.i)
        if m:
            word = m.group(0)
            self.i = m.end()
            consts = {"true": True, "false": False, "null": None, "undefined": None}
            if word in consts:
                return consts[word]
            self.error("unsupported identifier %r" % word)
        self.error("unexpected character %r" % c)

    def string(self):
        q = self.s[self.i]
        self.i += 1
        out = []
        while True:
            if self.i >= len(self.s):
                self.error("unterminated string")
            c = self.s[self.i]
            if c == q:
                self.i += 1
                return "".join(out)
            if c == "\\":
                nxt = self.s[self.i + 1]
                if nxt == "u":
                    out.append(chr(int(self.s[self.i + 2:self.i + 6], 16)))
                    self.i += 6
                    continue
                out.append({"n": "\n", "t": "\t", "r": "\r", "b": "\b", "f": "\f", "0": "\0", "\n": ""}.get(nxt, nxt))
                self.i += 2
                continue
            out.append(c)
            self.i += 1

    def key(self):
        c = self.peek()
        if c in "\"'":
            return self.string()
        m = _IDENT.match(self.s, self.i) or _NUMBER.match(self.s, self.i)
        if not m:
            self.error("expected a key")
        self.i = m.end()
        return m.group(0)

    def obj(self):
        self.expect("{")
        out = {}
        while True:
            if self.peek() == "}":
                self.i += 1
                return out
            k = self.key()
            self.expect(":")
            out[k] = self.value()
            if self.peek() == ",":
                self.i += 1
            elif self.peek() != "}":
                self.error("expected ',' or '}'")

    def arr(self):
        self.expect("[")
        out = []
        while True:
            if self.peek() == "]":
                self.i += 1
                return out
            out.append(self.value())
            if self.peek() == ",":
                self.i += 1
            elif self.peek() != "]":
                self.error("expected ',' or ']'")


def parse_literal(text):
    """Parse one JS literal (object, array, string, number...)."""
    p = _Parser(text)
    val = p.value()
    return val


def parse_data_js(text):
    """`window.BUSINESS = {...};` -> dict."""
    m = re.search(r"window\.BUSINESS\s*=\s*", text)
    if not m:
        raise JSDataError("window.BUSINESS = {...} not found")
    p = _Parser(text)
    p.i = m.end()
    data = p.obj()
    if not isinstance(data, dict):
        raise JSDataError("window.BUSINESS is not an object")
    return json.loads(json.dumps(data))   # plain JSON types only
