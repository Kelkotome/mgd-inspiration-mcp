// MCP r3 test loader: src/*.js imports .json (as modules) and .html (as text, like wrangler's Text rule).
import { register } from "node:module";
register("./loader.mjs", import.meta.url);
