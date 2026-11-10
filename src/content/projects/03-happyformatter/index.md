---
title: "HappyFormatter"
description: "Private in-browser code formatter and minifier for 20+ languages, built on WebAssembly."
date: "2026-09-26"
demoURL: "https://happyformatter.com"
---

## Overview

[HappyFormatter](https://happyformatter.com) formats, minifies, and converts code for more than 20 languages entirely in the browser. The formatters are compiled to WebAssembly, so parsing runs locally: pasted code never leaves the tab.

## What it does

- Formats Lua, Luau, Dart, Go, Rust, Python, TypeScript, SQL, YAML, and more.
- Minifies CSS, JavaScript, TypeScript, JSON, XML, and GraphQL.
- Ships 40+ utility tools: encoders, decoders, converters, and generators.
- Serves AI-friendly content at `llms.txt` and raw Markdown per tool.

## Engineering notes

The interesting parts are client-side: bundling `@wasm-fmt` engines for each language, streaming large files through the parser without blocking the UI, and keeping the whole toolset static so it can run on the edge with zero server compute.

## Link

Try it at [happyformatter.com](https://happyformatter.com).
