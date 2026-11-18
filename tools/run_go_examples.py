#!/usr/bin/env python3
"""Run every Go block of a tutorial page and compare with the Output block that follows it.

usage: python3 run_go_examples.py page.html [more.html]

Rules it checks:
- <script type="text/plain" data-lang="go" data-file="main.go"> ... </script> is a complete program
  (package main). It is run with `go run .` in a fresh module (20 s timeout), must exit 0.
- If the NEXT script block is data-lang="text" data-file="Output", its text must equal the program's
  stdout+stderr (trailing spaces ignored). Add the bare attribute data-nondet to the Output block when
  the output legitimately differs between runs (timings, random ids, goroutine order): then only exit 0 is checked.
- data-norun on a go block skips it (fragments, compile-error demos, panics, deadlocks).
- data-group="name" on several blocks: they are written into one folder under their data-file names
  (path may contain folders, module path is example.com/demo) and checked together: `go vet ./...`,
  `go test ./...` if any *_test.go exists, and `go run .` if a root main.go exists (its Output block
  is the one following the main.go block).
"""
import html, os, re, subprocess, sys, tempfile

BLOCK = re.compile(r'<script type="text/plain"([^>]*)>\n?(.*?)</script>', re.S)

def attrs(a):
    d = {k: v for k, v in re.findall(r'([\w-]+)="([^"]*)"', a)}
    for flag in ("data-norun", "data-nondet"):
        if re.search(r'(^|\s)' + flag + r'(\s|$|=)', a): d[flag] = "1"
    return d

def norm(s):
    return "\n".join(l.rstrip() for l in s.strip().splitlines())

def sh(cmd, cwd):
    try:
        p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=60)
        return p.returncode, p.stdout + p.stderr
    except subprocess.TimeoutExpired:
        return -1, "TIMEOUT"

def check(page):
    src = open(page).read()
    blocks = [(attrs(a), body) for a, body in BLOCK.findall(src)]
    fails = ran = 0
    groups = {}
    for i, (a, body) in enumerate(blocks):
        if a.get("data-lang") != "go" or "data-norun" in a: continue
        nxt = blocks[i + 1] if i + 1 < len(blocks) else None
        out = nxt if nxt and nxt[0].get("data-file") == "Output" else None
        if "data-group" in a:
            groups.setdefault(a["data-group"], []).append((a, body, out)); continue
        groups["#%d %s" % (i, a.get("data-file", "main.go"))] = [({"data-file": "main.go"}, body, out)]
    for name, items in groups.items():
        ran += 1
        with tempfile.TemporaryDirectory() as d:
            open(os.path.join(d, "go.mod"), "w").write("module example.com/demo\n\ngo 1.27\n")
            main_out, has_test, has_main = None, False, False
            for a, body, out in items:
                f = os.path.join(d, a.get("data-file", "main.go"))
                os.makedirs(os.path.dirname(f), exist_ok=True)
                open(f, "w").write(body.rstrip() + "\n")
                if a.get("data-file", "main.go") == "main.go": has_main, main_out = True, out
                if f.endswith("_test.go"): has_test = True
            problems = []
            rc, o = sh(["gofmt", "-l", "."], d)
            if o.strip(): problems.append("not gofmt-formatted: " + o.strip())
            rc, o = sh(["go", "vet", "./..."], d)
            if rc: problems.append("go vet:\n" + o)
            if has_test:
                rc, o = sh(["go", "test", "./..."], d)
                if rc: problems.append("go test:\n" + o)
            if has_main and not problems:
                rc, o = sh(["go", "run", "."], d)
                if rc: problems.append("go run exit %s:\n%s" % (rc, o))
                elif main_out and "data-nondet" not in main_out[0] and norm(o) != norm(main_out[1]):
                    problems.append("output differs.\n--- page\n%s\n--- real\n%s" % (norm(main_out[1]), norm(o)))
            if problems:
                fails += 1
                print("FAIL %s :: %s\n%s\n" % (page, name, "\n".join(problems)))
    ids = set(re.findall(r'id="([^"]+)"', src)); refs = set(re.findall(r'href="#([^"]+)"', src))
    if refs - ids: fails += 1; print("FAIL broken anchors:", refs - ids)
    print("%s: %d programs checked, %d failed" % (os.path.basename(page), ran, fails))
    return fails

if __name__ == "__main__":
    sys.exit(1 if sum(check(p) for p in sys.argv[1:]) else 0)
