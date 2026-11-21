#!/usr/bin/env python3
"""Type-check (and test) the React / Next.js code blocks of a tutorial page inside a real project.

usage: python3 tools/check_frontend_examples.py PAGE.html --base BASE_DIR [--build] [--only GROUP]

BASE_DIR is a working project with node_modules installed:
  React: npm create vite@latest base -- --template react-ts, plus react-router-dom, vitest, jsdom,
         @testing-library/react, @testing-library/user-event, @testing-library/jest-dom,
         a vitest.config.ts (jsdom, setupFiles src/setupTests.ts) and src/setupTests.ts.
  Next:  npx create-next-app@latest base --ts --tailwind --app --no-src-dir --no-eslint --use-npm
Node 20 or newer must be first on PATH.

What it reads from the page:
- every <script type="text/plain" data-lang="tsx|ts|css|json" data-file="path/in/project.ext"> block is
  a file of the project, written at that path;
- the bare attribute data-norun skips a block (fragments, "before" versions that are wrong on purpose);
- data-group="name" puts a block in a named group. Each group is checked in its own fresh copy of the
  base project, so two exercises may both have a src/App.tsx. Blocks without data-group form the group
  "main". Blocks with data-group="shared" are added to every group.

What it runs per group:
- React base (has vite.config.ts):  npx tsc -p tsconfig.app.json --noEmit, then npx vitest run if the
  group contains a *.test.ts(x) file;
- Next base (has next.config.*):    npx next typegen, npx tsc --noEmit, and npx next build when
  --build is given.
Prints one line per group and "N groups checked, M failed".
"""
import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile

BLOCK = re.compile(r'<script type="text/plain"([^>]*)>\n?(.*?)</script>', re.S)
LANGS = {"tsx", "ts", "css", "json"}
SKIP = {"node_modules", ".next", ".git", "dist"}


def attrs(a):
    d = dict(re.findall(r'([\w-]+)="([^"]*)"', a))
    if re.search(r'(^|\s)data-norun(\s|$|=)', a):
        d["data-norun"] = "1"
    return d


def sh(cmd, cwd, timeout=600):
    try:
        p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)
        return p.returncode, (p.stdout + p.stderr).strip()
    except subprocess.TimeoutExpired:
        return -1, "TIMEOUT"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("page")
    ap.add_argument("--base", required=True)
    ap.add_argument("--build", action="store_true")
    ap.add_argument("--only")
    args = ap.parse_args()
    base = os.path.abspath(args.base)
    is_next = any(os.path.exists(os.path.join(base, "next.config." + e)) for e in ("ts", "js", "mjs"))

    groups, shared = {}, []
    for a, body in BLOCK.findall(open(args.page).read()):
        a = attrs(a)
        path = a.get("data-file", "")
        if a.get("data-lang") not in LANGS or "data-norun" in a or not re.search(r"\.\w+$", path):
            continue
        item = (path, body.rstrip() + "\n")
        if a.get("data-group") == "shared":
            shared.append(item)
        else:
            groups.setdefault(a.get("data-group", "main"), []).append(item)

    failed = 0
    names = [g for g in groups if not args.only or g == args.only]
    for name in names:
        with tempfile.TemporaryDirectory() as tmp:
            proj = os.path.join(tmp, "p")
            shutil.copytree(base, proj, ignore=lambda d, fs: [f for f in fs if f in SKIP])
            if is_next:                       # Turbopack refuses a node_modules symlink that leaves the project
                subprocess.run(["cp", "-cR", os.path.join(base, "node_modules"), os.path.join(proj, "node_modules")],
                               check=True)     # -c clones on APFS, so this is fast and takes no extra space
            else:
                os.symlink(os.path.join(base, "node_modules"), os.path.join(proj, "node_modules"))
            seen, problems = set(), []
            for path, body in shared + groups[name]:
                if path in seen and (path, body) not in shared:
                    problems.append("file appears twice in the group: " + path)
                seen.add(path)
                full = os.path.join(proj, path)
                os.makedirs(os.path.dirname(full), exist_ok=True)
                open(full, "w").write(body)
            if is_next:                       # generates route and LayoutProps/PageProps types
                rc, out = sh(["npx", "next", "typegen"], proj)
                if rc:
                    problems.append("next typegen:\n" + out[-2000:])
            cmd = ["npx", "tsc", "--noEmit"] if is_next else ["npx", "tsc", "-p", "tsconfig.app.json", "--noEmit"]
            rc, out = sh(cmd, proj)
            if rc:
                problems.append("tsc:\n" + out)
            if not is_next and any(re.search(r"\.test\.tsx?$", p) for p in seen):
                rc, out = sh(["npx", "vitest", "run"], proj)
                if rc:
                    problems.append("vitest:\n" + out[-3000:])
            if is_next and args.build and not problems:
                rc, out = sh(["npx", "next", "build"], proj)
                if rc:
                    problems.append("next build:\n" + out[-3000:])
            if problems:
                failed += 1
                print("FAIL %s (%d files)\n%s\n" % (name, len(seen), "\n".join(problems)))
            else:
                print("ok   %s (%d files)" % (name, len(seen)))
    src = open(args.page).read()
    ids = set(re.findall(r'\sid="([^"]+)"', src))
    broken = set(re.findall(r'href="#([^"]+)"', src)) - ids
    if broken:
        failed += 1
        print("FAIL broken anchors:", broken)
    print("%s: %d groups checked, %d failed" % (os.path.basename(args.page), len(names), failed))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
