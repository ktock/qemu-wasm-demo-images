
var Module = (() => {
  var _scriptDir = import.meta.url;
  
  return (
async function(moduleArg = {}) {

// include: shell.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = moduleArg;

// Set up the promise that indicates the Module is initialized
var readyPromiseResolve, readyPromiseReject;
Module['ready'] = new Promise((resolve, reject) => {
  readyPromiseResolve = resolve;
  readyPromiseReject = reject;
});

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)


// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window == 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = typeof process == 'object' && typeof process.versions == 'object' && typeof process.versions.node == 'string';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

// Three configurations we can be running in:
// 1) We could be the application main() thread running in the main JS UI thread. (ENVIRONMENT_IS_WORKER == false and ENVIRONMENT_IS_PTHREAD == false)
// 2) We could be the application main() thread proxied to worker. (with Emscripten -sPROXY_TO_WORKER) (ENVIRONMENT_IS_WORKER == true, ENVIRONMENT_IS_PTHREAD == false)
// 3) We could be an application pthread running in a worker. (ENVIRONMENT_IS_WORKER == true and ENVIRONMENT_IS_PTHREAD == true)

// ENVIRONMENT_IS_PTHREAD=true will have been preset in worker.js. Make it false in the main runtime thread.
var ENVIRONMENT_IS_PTHREAD = Module['ENVIRONMENT_IS_PTHREAD'] || false;

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary;

if (ENVIRONMENT_IS_NODE) {

  // `require()` is no-op in an ESM module, use `createRequire()` to construct
  // the require()` function.  This is only necessary for multi-environment
  // builds, `-sENVIRONMENT=node` emits a static import declaration instead.
  // TODO: Swap all `require()`'s with `import()`'s?
  const { createRequire } = await import('module');
  /** @suppress{duplicate} */
  var require = createRequire(import.meta.url);
  // These modules will usually be used on Node.js. Load them eagerly to avoid
  // the complexity of lazy-loading.
  var fs = require('fs');
  var nodePath = require('path');

  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = nodePath.dirname(scriptDirectory) + '/';
  } else {
    // EXPORT_ES6 + ENVIRONMENT_IS_NODE always requires use of import.meta.url,
    // since there's no way getting the current absolute path of the module when
    // support for that is not available.
    scriptDirectory = require('url').fileURLToPath(new URL('./', import.meta.url)); // includes trailing slash
  }

// include: node_shell_read.js
read_ = (filename, binary) => {
  // We need to re-wrap `file://` strings to URLs. Normalizing isn't
  // necessary in that case, the path should already be absolute.
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  return fs.readFileSync(filename, binary ? undefined : 'utf8');
};

readBinary = (filename) => {
  var ret = read_(filename, true);
  if (!ret.buffer) {
    ret = new Uint8Array(ret);
  }
  return ret;
};

readAsync = (filename, onload, onerror, binary = true) => {
  // See the comment in the `read_` function.
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  fs.readFile(filename, binary ? undefined : 'utf8', (err, data) => {
    if (err) onerror(err);
    else onload(binary ? data.buffer : data);
  });
};
// end include: node_shell_read.js
  if (!Module['thisProgram'] && process.argv.length > 1) {
    thisProgram = process.argv[1].replace(/\\/g, '/');
  }

  arguments_ = process.argv.slice(2);

  // MODULARIZE will export the module in the proper place outside, we don't need to export here

  process.on('uncaughtException', (ex) => {
    // suppress ExitStatus exceptions from showing an error
    if (ex !== 'unwind' && !(ex instanceof ExitStatus) && !(ex.context instanceof ExitStatus)) {
      throw ex;
    }
  });

  quit_ = (status, toThrow) => {
    process.exitCode = status;
    throw toThrow;
  };

  Module['inspect'] = () => '[Emscripten Module object]';

  let nodeWorkerThreads;
  try {
    nodeWorkerThreads = require('worker_threads');
  } catch (e) {
    console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?');
    throw e;
  }
  global.Worker = nodeWorkerThreads.Worker;

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document != 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // When MODULARIZE, this JS may be executed later, after document.currentScript
  // is gone, so we saved it, and we use it here instead of any other info.
  if (_scriptDir) {
    scriptDirectory = _scriptDir;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  if (!ENVIRONMENT_IS_NODE)
  {
// include: web_or_worker_shell_read.js
read_ = (url) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  }

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = (url) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.responseType = 'arraybuffer';
      xhr.send(null);
      return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
    };
  }

  readAsync = (url, onload, onerror) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  }

// end include: web_or_worker_shell_read.js
  }
} else
{
}

if (ENVIRONMENT_IS_NODE) {
  // Polyfill the performance object, which emscripten pthreads support
  // depends on for good timing.
  if (typeof performance == 'undefined') {
    global.performance = require('perf_hooks').performance;
  }
}

// Set up the out() and err() hooks, which are how we can print to stdout or
// stderr, respectively.
// Normally just binding console.log/console.error here works fine, but
// under node (with workers) we see missing/out-of-order messages so route
// directly to stdout and stderr.
// See https://github.com/emscripten-core/emscripten/issues/14804
var defaultPrint = console.log.bind(console);
var defaultPrintErr = console.error.bind(console);
if (ENVIRONMENT_IS_NODE) {
  defaultPrint = (...args) => fs.writeSync(1, args.join(' ') + '\n');
  defaultPrintErr = (...args) => fs.writeSync(2, args.join(' ') + '\n');
}
var out = Module['print'] || defaultPrint;
var err = Module['printErr'] || defaultPrintErr;

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];

if (Module['thisProgram']) thisProgram = Module['thisProgram'];

if (Module['quit']) quit_ = Module['quit'];

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message

// end include: shell.js
// include: preamble.js
// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary; 
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];

if (typeof WebAssembly != 'object') {
  abort('no native wasm support detected');
}

// include: base64Utils.js
// Converts a string of base64 into a byte array (Uint8Array).
function intArrayFromBase64(s) {
  if (typeof ENVIRONMENT_IS_NODE != 'undefined' && ENVIRONMENT_IS_NODE) {
    var buf = Buffer.from(s, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
  }

  var decoded = atob(s);
  var bytes = new Uint8Array(decoded.length);
  for (var i = 0 ; i < decoded.length ; ++i) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return bytes;
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}
// end include: base64Utils.js
// Wasm globals

var wasmMemory;

// For sending to workers.
var wasmModule;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    // This build was created without ASSERTIONS defined.  `assert()` should not
    // ever be called in this configuration but in case there are callers in
    // the wild leave this simple abort() implemenation here for now.
    abort(text);
  }
}

// Memory management

var HEAP,
/** @type {!Int8Array} */
  HEAP8,
/** @type {!Uint8Array} */
  HEAPU8,
/** @type {!Int16Array} */
  HEAP16,
/** @type {!Uint16Array} */
  HEAPU16,
/** @type {!Int32Array} */
  HEAP32,
/** @type {!Uint32Array} */
  HEAPU32,
/** @type {!Float32Array} */
  HEAPF32,
/* BigInt64Array type is not correctly defined in closure
/** not-@type {!BigInt64Array} */
  HEAP64,
/* BigUInt64Array type is not correctly defined in closure
/** not-t@type {!BigUint64Array} */
  HEAPU64,
/** @type {!Float64Array} */
  HEAPF64;

function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module['HEAP8'] = HEAP8 = new Int8Array(b);
  Module['HEAP16'] = HEAP16 = new Int16Array(b);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
  Module['HEAP32'] = HEAP32 = new Int32Array(b);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
  Module['HEAP64'] = HEAP64 = new BigInt64Array(b);
  Module['HEAPU64'] = HEAPU64 = new BigUint64Array(b);
}

// In non-standalone/normal mode, we create the memory here.
// include: runtime_init_memory.js
// Create the wasm memory. (Note: this only applies if IMPORTED_MEMORY is defined)

var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 2147483648;

  
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)

if (ENVIRONMENT_IS_PTHREAD) {
  wasmMemory = Module['wasmMemory'];
} else {

  if (Module['wasmMemory']) {
    wasmMemory = Module['wasmMemory'];
  } else
  {
    wasmMemory = new WebAssembly.Memory({
      'initial': INITIAL_MEMORY / 65536,
      'maximum': INITIAL_MEMORY / 65536,
      'shared': true,
    });
    if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
      err('requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag');
      if (ENVIRONMENT_IS_NODE) {
        err('(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)');
      }
      throw Error('bad memory');
    }
  }

}

updateMemoryViews();

// If the user provides an incorrect length, just use that length instead rather than providing the user to
// specifically provide the memory length with Module['INITIAL_MEMORY'].
INITIAL_MEMORY = wasmMemory.buffer.byteLength;
// end include: runtime_init_memory.js

// include: runtime_stack_check.js
// end include: runtime_stack_check.js
// include: runtime_assertions.js
// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;

function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  runtimeInitialized = true;

  if (ENVIRONMENT_IS_PTHREAD) return;

  
if (!Module["noFSInit"] && !FS.init.initialized)
  FS.init();
FS.ignorePermissions = false;

TTY.init();

        PTY.onSignal((signalName) => {
            let signalCode = PTY_signalNameToCode[signalName];
            _raise(signalCode);
        });
    
SOCKFS.root = FS.mount(SOCKFS, {}, null);
PIPEFS.root = FS.mount(PIPEFS, {}, null);
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  if (ENVIRONMENT_IS_PTHREAD) return; // PThreads reuse the runtime from the main thread.
  
  callRuntimeCallbacks(__ATMAIN__);
}

function postRun() {
  if (ENVIRONMENT_IS_PTHREAD) return; // PThreads reuse the runtime from the main thread.

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function getUniqueRunDependency(id) {
  return id;
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

/** @param {string|number=} what */
function abort(what) {
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  what += '. Build with -sASSERTIONS for more info.';

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // defintion for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  readyPromiseReject(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// include: memoryprofiler.js
// end include: memoryprofiler.js
// include: URIUtils.js
// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */
var isDataURI = (filename) => filename.startsWith(dataURIPrefix);

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */
var isFileURI = (filename) => filename.startsWith('file://');
// end include: URIUtils.js
// include: runtime_exceptions.js
// end include: runtime_exceptions.js
var wasmBinaryFile;
if (Module['locateFile']) {
  wasmBinaryFile = 'qemu-system-aarch64.wasm';
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }
} else {
  // Use bundler-friendly `new URL(..., import.meta.url)` pattern; works in browsers too.
  wasmBinaryFile = new URL('qemu-system-aarch64.wasm', import.meta.url).href;
}

function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(file);
  }
  throw "both async and sync fetching of the wasm failed";
}

function getBinaryPromise(binaryFile) {
  // If we don't have the binary yet, try to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary
      && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch == 'function'
      && !isFileURI(binaryFile)
    ) {
      return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + binaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(() => getBinarySync(binaryFile));
    }
    else if (readAsync) {
      // fetch is not available or url is file => try XHR (readAsync uses XHR internally)
      return new Promise((resolve, reject) => {
        readAsync(binaryFile, (response) => resolve(new Uint8Array(/** @type{!ArrayBuffer} */(response))), reject)
      });
    }
  }

  // Otherwise, getBinarySync should be able to get it synchronously
  return Promise.resolve().then(() => getBinarySync(binaryFile));
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
  return getBinaryPromise(binaryFile).then((binary) => {
    return WebAssembly.instantiate(binary, imports);
  }).then((instance) => {
    return instance;
  }).then(receiver, (reason) => {
    err(`failed to asynchronously prepare wasm: ${reason}`);

    abort(reason);
  });
}

function instantiateAsync(binary, binaryFile, imports, callback) {
  if (!binary &&
      typeof WebAssembly.instantiateStreaming == 'function' &&
      !isDataURI(binaryFile) &&
      // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
      !isFileURI(binaryFile) &&
      // Avoid instantiateStreaming() on Node.js environment for now, as while
      // Node.js v18.1.0 implements it, it does not have a full fetch()
      // implementation yet.
      //
      // Reference:
      //   https://github.com/emscripten-core/emscripten/pull/16917
      !ENVIRONMENT_IS_NODE &&
      typeof fetch == 'function') {
    return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
      // Suppress closure warning here since the upstream definition for
      // instantiateStreaming only allows Promise<Repsponse> rather than
      // an actual Response.
      // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
      /** @suppress {checkTypes} */
      var result = WebAssembly.instantiateStreaming(response, imports);

      return result.then(
        callback,
        function(reason) {
          // We expect the most common failure cause to be a bad MIME type for the binary,
          // in which case falling back to ArrayBuffer instantiation should work.
          err(`wasm streaming compile failed: ${reason}`);
          err('falling back to ArrayBuffer instantiation');
          return instantiateArrayBuffer(binaryFile, imports, callback);
        });
    });
  }
  return instantiateArrayBuffer(binaryFile, imports, callback);
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': wasmImports,
    'wasi_snapshot_preview1': wasmImports,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    wasmExports = instance.exports;

    wasmExports = Asyncify.instrumentWasmExports(wasmExports);

    

    registerTLSInit(wasmExports['_emscripten_tls_init']);

    wasmTable = wasmExports['__indirect_function_table'];
    

    addOnInit(wasmExports['__wasm_call_ctors']);

    // We now have the Wasm module loaded up, keep a reference to the compiled module so we can post it to the workers.
    wasmModule = module;
    removeRunDependency('wasm-instantiate');
    return wasmExports;
  }
  // wait for the pthread pool (if any)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    receiveInstance(result['instance'], result['module']);
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to
  // run the instantiation parallel to any other async startup actions they are
  // performing.
  // Also pthreads and wasm workers initialize the wasm instance through this
  // path.
  if (Module['instantiateWasm']) {

    try {
      return Module['instantiateWasm'](info, receiveInstance);
    } catch(e) {
      err(`Module.instantiateWasm callback failed with error: ${e}`);
        // If instantiation fails, reject the module ready promise.
        readyPromiseReject(e);
    }
  }

  // If instantiation fails, reject the module ready promise.
  instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
  return {}; // no exports yet; we'll fill them in later
}

// include: runtime_debug.js
// end include: runtime_debug.js
// === Body ===

function instantiate_wasm() { const memory_v = new DataView(HEAP8.buffer); const tb_ptr = memory_v.getInt32(Module.__wasm32_tb.tb_ptr_ptr, true); const export_vec_size = memory_v.getInt32(tb_ptr + 4, true); const export_vec_begin = tb_ptr + 4 + 4; const tmp_body_size = memory_v.getInt32(export_vec_begin + export_vec_size, true); const tmp_body_begin = export_vec_begin + export_vec_size + 4; const wasm_size = memory_v.getInt32(tmp_body_begin + tmp_body_size, true); const wasm_begin = tmp_body_begin + tmp_body_size + 4; const import_vec_size = memory_v.getInt32(wasm_begin + wasm_size, true); const import_vec_begin = wasm_begin + wasm_size + 4; const wasm = HEAP8.subarray(wasm_begin, wasm_begin + wasm_size); var helper = {}; for (var i = 0; i < import_vec_size / 4; i++) { helper[i] = wasmTable.get(memory_v.getInt32(import_vec_begin + i * 4, true)); } const mod = new WebAssembly.Module(wasm); const inst = new WebAssembly.Instance(mod, { "env": { "buffer": wasmMemory, }, "helper": helper, }); var ptr = export_vec_begin + 4 * Module.__wasm32_tb.cur_core_num; const fidx = addFunction(inst.exports.start, 'ii'); memory_v.setUint32(ptr, fidx, true); const remove_n = memory_v.getInt32(Module.__wasm32_tb.to_remove_instance_idx_ptr, true); if (remove_n > 500) { for (var i = 0; i < remove_n * 4; i += 4) { removeFunction(memory_v.getInt32(Module.__wasm32_tb.to_remove_instance_ptr + i, true)); } memory_v.setInt32(Module.__wasm32_tb.to_remove_instance_idx_ptr, 0, true); } return 0; }
function init_wasm32_js(tb_ptr_ptr,cur_core_num,to_remove_instance_ptr,to_remove_instance_idx_ptr) { Module.__wasm32_tb = { tb_ptr_ptr: tb_ptr_ptr, cur_core_num: cur_core_num, to_remove_instance_ptr: to_remove_instance_ptr, to_remove_instance_idx_ptr: to_remove_instance_idx_ptr, }; }
function unbox_small_structs(type_ptr) { var type_id = HEAPU16[(type_ptr + 6 >> 1) + 0]; while (type_id === 13) { var elements = HEAPU32[(type_ptr + 8 >> 2) + 0]; var first_element = HEAPU32[(elements >> 2) + 0]; if (first_element === 0) { type_id = 0; break; } else if (HEAPU32[(elements >> 2) + 1] === 0) { type_ptr = first_element; type_id = HEAPU16[(first_element + 6 >> 1) + 0]; } else { break; } } return [type_ptr, type_id]; }
function ffi_call_js(cif,fn,rvalue,avalue) { var abi = HEAPU32[(cif >> 2) + 0]; var nargs = HEAPU32[(cif >> 2) + 1]; var nfixedargs = HEAPU32[(cif >> 2) + 6]; var arg_types_ptr = HEAPU32[(cif >> 2) + 2]; var rtype_unboxed = unbox_small_structs(HEAPU32[(cif >> 2) + 3]); var rtype_ptr = rtype_unboxed[0]; var rtype_id = rtype_unboxed[1]; var orig_stack_ptr = stackSave(); var cur_stack_ptr = orig_stack_ptr; var args = []; var ret_by_arg = false; if (rtype_id === 15) { throw new Error('complex ret marshalling nyi'); } if (rtype_id < 0 || rtype_id > 15) { throw new Error('Unexpected rtype ' + rtype_id); } if (rtype_id === 4 || rtype_id === 13) { args.push(rvalue); ret_by_arg = true; } ; for (var i = 0; i < nfixedargs; i++) { var arg_ptr = HEAPU32[(avalue >> 2) + i]; var arg_unboxed = unbox_small_structs(HEAPU32[(arg_types_ptr >> 2) + i]); var arg_type_ptr = arg_unboxed[0]; var arg_type_id = arg_unboxed[1]; switch (arg_type_id) { case 1: case 10: case 9: case 14: args.push(HEAPU32[(arg_ptr >> 2) + 0]); ; break; case 2: args.push(HEAPF32[(arg_ptr >> 2) + 0]); ; break; case 3: args.push(HEAPF64[(arg_ptr >> 3) + 0]); ; break; case 5: args.push(HEAPU8[arg_ptr + 0]); ; break; case 6: args.push(HEAP8[arg_ptr + 0]); ; break; case 7: args.push(HEAPU16[(arg_ptr >> 1) + 0]); ; break; case 8: args.push(HEAP16[(arg_ptr >> 1) + 0]); ; break; case 11: case 12: args.push(HEAPU64[(arg_ptr >> 3) + 0]); ; break; case 4: args.push(HEAPU64[(arg_ptr >> 3) + 0]); args.push(HEAPU64[(arg_ptr >> 3) + 1]); ; break; case 13: var size = HEAPU32[(arg_type_ptr >> 2) + 0]; var align = HEAPU16[(arg_type_ptr + 4 >> 1) + 0]; ((cur_stack_ptr -= (size)), (cur_stack_ptr &= (~((align) - 1)))); HEAP8.subarray(cur_stack_ptr, cur_stack_ptr+size).set(HEAP8.subarray(arg_ptr, arg_ptr + size)); args.push(cur_stack_ptr); ; break; case 15: throw new Error('complex marshalling nyi'); default: throw new Error('Unexpected type ' + arg_type_id); } } if (nfixedargs != nargs) { ; var struct_arg_info = []; for (var i = nargs - 1; i >= nfixedargs; i--) { var arg_ptr = HEAPU32[(avalue >> 2) + i]; var arg_unboxed = unbox_small_structs(HEAPU32[(arg_types_ptr >> 2) + i]); var arg_type_ptr = arg_unboxed[0]; var arg_type_id = arg_unboxed[1]; switch (arg_type_id) { case 5: case 6: ((cur_stack_ptr -= (1)), (cur_stack_ptr &= (~((1) - 1)))); HEAPU8[cur_stack_ptr + 0] = HEAPU8[arg_ptr + 0]; break; case 7: case 8: ((cur_stack_ptr -= (2)), (cur_stack_ptr &= (~((2) - 1)))); HEAPU16[(cur_stack_ptr >> 1) + 0] = HEAPU16[(arg_ptr >> 1) + 0]; break; case 1: case 9: case 10: case 14: case 2: ((cur_stack_ptr -= (4)), (cur_stack_ptr &= (~((4) - 1)))); HEAPU32[(cur_stack_ptr >> 2) + 0] = HEAPU32[(arg_ptr >> 2) + 0]; break; case 3: case 11: case 12: ((cur_stack_ptr -= (8)), (cur_stack_ptr &= (~((8) - 1)))); HEAPU32[(cur_stack_ptr >> 2) + 0] = HEAPU32[(arg_ptr >> 2) + 0]; HEAPU32[(cur_stack_ptr >> 2) + 1] = HEAPU32[(arg_ptr >> 2) + 1]; break; case 4: ((cur_stack_ptr -= (16)), (cur_stack_ptr &= (~((8) - 1)))); HEAPU32[(cur_stack_ptr >> 2) + 0] = HEAPU32[(arg_ptr >> 2) + 0]; HEAPU32[(cur_stack_ptr >> 2) + 1] = HEAPU32[(arg_ptr >> 2) + 1]; HEAPU32[(cur_stack_ptr >> 2) + 2] = HEAPU32[(arg_ptr >> 2) + 2]; HEAPU32[(cur_stack_ptr >> 2) + 3] = HEAPU32[(arg_ptr >> 2) + 3]; break; case 13: ((cur_stack_ptr -= (4)), (cur_stack_ptr &= (~((4) - 1)))); struct_arg_info.push([cur_stack_ptr, arg_ptr, HEAPU32[(arg_type_ptr >> 2) + 0], HEAPU16[(arg_type_ptr + 4 >> 1) + 0]]); break; case 15: throw new Error('complex arg marshalling nyi'); default: throw new Error('Unexpected argtype ' + arg_type_id); } } args.push(cur_stack_ptr); for (var i = 0; i < struct_arg_info.length; i++) { var struct_info = struct_arg_info[i]; var arg_target = struct_info[0]; var arg_ptr = struct_info[1]; var size = struct_info[2]; var align = struct_info[3]; ((cur_stack_ptr -= (size)), (cur_stack_ptr &= (~((align) - 1)))); HEAP8.subarray(cur_stack_ptr, cur_stack_ptr+size).set(HEAP8.subarray(arg_ptr, arg_ptr + size)); HEAPU32[(arg_target >> 2) + 0] = cur_stack_ptr; } } stackRestore(cur_stack_ptr); stackAlloc(0); var result = (0, getWasmTableEntry(fn).apply(null, args)); stackRestore(orig_stack_ptr); if (ret_by_arg) { return; } switch (rtype_id) { case 0: break; case 1: case 9: case 10: case 14: HEAPU32[(rvalue >> 2) + 0] = result; break; case 2: HEAPF32[(rvalue >> 2) + 0] = result; break; case 3: HEAPF64[(rvalue >> 3) + 0] = result; break; case 5: case 6: HEAPU8[rvalue + 0] = result; break; case 7: case 8: HEAPU16[(rvalue >> 1) + 0] = result; break; case 11: case 12: HEAPU64[(rvalue >> 3) + 0] = result; break; case 15: throw new Error('complex ret marshalling nyi'); default: throw new Error('Unexpected rtype ' + rtype_id); } }
function ffi_closure_alloc_js(size,code) { var closure = _malloc(size); var index = getEmptyTableSlot(); HEAPU32[(code >> 2) + 0] = index; HEAPU32[(closure >> 2) + 0] = index; return closure; }
function ffi_closure_free_js(closure) { var index = HEAPU32[(closure >> 2) + 0]; freeTableIndexes.push(index); _free(closure); }
function ffi_prep_closure_loc_js(closure,cif,fun,user_data,codeloc) { var abi = HEAPU32[(cif >> 2) + 0]; var nargs = HEAPU32[(cif >> 2) + 1]; var nfixedargs = HEAPU32[(cif >> 2) + 6]; var arg_types_ptr = HEAPU32[(cif >> 2) + 2]; var rtype_unboxed = unbox_small_structs(HEAPU32[(cif >> 2) + 3]); var rtype_ptr = rtype_unboxed[0]; var rtype_id = rtype_unboxed[1]; var sig; var ret_by_arg = false; switch (rtype_id) { case 0: sig = 'v'; break; case 13: case 4: sig = 'vi'; ret_by_arg = true; break; case 1: case 5: case 6: case 7: case 8: case 9: case 10: case 14: sig = 'i'; break; case 2: sig = 'f'; break; case 3: sig = 'd'; break; case 11: case 12: sig = 'j'; break; case 15: throw new Error('complex ret marshalling nyi'); default: throw new Error('Unexpected rtype ' + rtype_id); } var unboxed_arg_type_id_list = []; var unboxed_arg_type_info_list = []; for (var i = 0; i < nargs; i++) { var arg_unboxed = unbox_small_structs(HEAPU32[(arg_types_ptr >> 2) + i]); var arg_type_ptr = arg_unboxed[0]; var arg_type_id = arg_unboxed[1]; unboxed_arg_type_id_list.push(arg_type_id); unboxed_arg_type_info_list.push([HEAPU32[(arg_type_ptr >> 2) + 0], HEAPU16[(arg_type_ptr + 4 >> 1) + 0]]); } for (var i = 0; i < nfixedargs; i++) { switch (unboxed_arg_type_id_list[i]) { case 1: case 5: case 6: case 7: case 8: case 9: case 10: case 14: case 13: sig += 'i'; break; case 2: sig += 'f'; break; case 3: sig += 'd'; break; case 4: sig += 'jj'; break; case 11: case 12: sig += 'j'; break; case 15: throw new Error('complex marshalling nyi'); default: throw new Error('Unexpected argtype ' + arg_type_id); } } if (nfixedargs < nargs) { sig += "i"; } 0; function trampoline() { var args = Array.prototype.slice.call(arguments); var size = 0; var orig_stack_ptr = stackSave(); var cur_ptr = orig_stack_ptr; var ret_ptr; var jsarg_idx = 0; if (ret_by_arg) { ret_ptr = args[jsarg_idx++]; } else { ((cur_ptr -= (8)), (cur_ptr &= (~((8) - 1)))); ret_ptr = cur_ptr; } cur_ptr -= 4 * nargs; var args_ptr = cur_ptr; var carg_idx = 0; for (; carg_idx < nfixedargs; carg_idx++) { var cur_arg = args[jsarg_idx++]; var arg_type_info = unboxed_arg_type_info_list[carg_idx]; var arg_size = arg_type_info[0]; var arg_align = arg_type_info[1]; var arg_type_id = unboxed_arg_type_id_list[carg_idx]; switch (arg_type_id) { case 5: case 6: ((cur_ptr -= (1)), (cur_ptr &= (~((4) - 1)))); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; HEAPU8[cur_ptr + 0] = cur_arg; break; case 7: case 8: ((cur_ptr -= (2)), (cur_ptr &= (~((4) - 1)))); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; HEAPU16[(cur_ptr >> 1) + 0] = cur_arg; break; case 1: case 9: case 10: case 14: ((cur_ptr -= (4)), (cur_ptr &= (~((4) - 1)))); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; HEAPU32[(cur_ptr >> 2) + 0] = cur_arg; break; case 13: ((cur_ptr -= (arg_size)), (cur_ptr &= (~((arg_align) - 1)))); HEAP8.subarray(cur_ptr, cur_ptr + arg_size).set(HEAP8.subarray(cur_arg, cur_arg + arg_size)); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; break; case 2: ((cur_ptr -= (4)), (cur_ptr &= (~((4) - 1)))); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; HEAPF32[(cur_ptr >> 2) + 0] = cur_arg; break; case 3: ((cur_ptr -= (8)), (cur_ptr &= (~((8) - 1)))); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; HEAPF64[(cur_ptr >> 3) + 0] = cur_arg; break; case 11: case 12: ((cur_ptr -= (8)), (cur_ptr &= (~((8) - 1)))); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; HEAPU64[(cur_ptr >> 3) + 0] = cur_arg; break; case 4: ((cur_ptr -= (16)), (cur_ptr &= (~((8) - 1)))); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; HEAPU64[(cur_ptr >> 3) + 0] = cur_arg; cur_arg = args[jsarg_idx++]; HEAPU64[(cur_ptr >> 3) + 1] = cur_arg; break; } } var varargs = args[args.length - 1]; for (; carg_idx < nargs; carg_idx++) { var arg_type_id = unboxed_arg_type_id_list[carg_idx]; var arg_type_info = unboxed_arg_type_info_list[carg_idx]; var arg_size = arg_type_info[0]; var arg_align = arg_type_info[1]; if (arg_type_id === 13) { var struct_ptr = HEAPU32[(varargs >> 2) + 0]; ((cur_ptr -= (arg_size)), (cur_ptr &= (~((arg_align) - 1)))); HEAP8.subarray(cur_ptr, cur_ptr + arg_size).set(HEAP8.subarray(struct_ptr, struct_ptr + arg_size)); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; } else { HEAPU32[(args_ptr >> 2) + carg_idx] = varargs; } varargs += 4; } stackRestore(cur_ptr); stackAlloc(0); 0; getWasmTableEntry(HEAPU32[(closure >> 2) + 2])( HEAPU32[(closure >> 2) + 1], ret_ptr, args_ptr, HEAPU32[(closure >> 2) + 3] ); stackRestore(orig_stack_ptr); if (!ret_by_arg) { switch (sig[0]) { case "i": return HEAPU32[(ret_ptr >> 2) + 0]; case "j": return HEAPU64[(ret_ptr >> 3) + 0]; case "d": return HEAPF64[(ret_ptr >> 3) + 0]; case "f": return HEAPF32[(ret_ptr >> 2) + 0]; } } } try { var wasm_trampoline = convertJsFunctionToWasm(trampoline, sig); } catch(e) { return 1; } setWasmTableEntry(codeloc, wasm_trampoline); HEAPU32[(closure >> 2) + 1] = cif; HEAPU32[(closure >> 2) + 2] = fun; HEAPU32[(closure >> 2) + 3] = user_data; return 0; }


// end include: preamble.js

  /** @constructor */
  function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = `Program terminated with exit(${status})`;
      this.status = status;
    }

  
  
  var terminateWorker = (worker) => {
      worker.terminate();
      // terminate() can be asynchronous, so in theory the worker can continue
      // to run for some amount of time after termination.  However from our POV
      // the worker now dead and we don't want to hear from it again, so we stub
      // out its message handler here.  This avoids having to check in each of
      // the onmessage handlers if the message was coming from valid worker.
      worker.onmessage = (e) => {
      };
    };
  
  var killThread = (pthread_ptr) => {
      var worker = PThread.pthreads[pthread_ptr];
      delete PThread.pthreads[pthread_ptr];
      terminateWorker(worker);
      __emscripten_thread_free_data(pthread_ptr);
      // The worker was completely nuked (not just the pthread execution it was hosting), so remove it from running workers
      // but don't put it back to the pool.
      PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1); // Not a running Worker anymore.
      worker.pthread_ptr = 0;
    };
  
  var cancelThread = (pthread_ptr) => {
      var worker = PThread.pthreads[pthread_ptr];
      worker.postMessage({ 'cmd': 'cancel' });
    };
  
  var cleanupThread = (pthread_ptr) => {
      var worker = PThread.pthreads[pthread_ptr];
      PThread.returnWorkerToPool(worker);
    };
  
  var zeroMemory = (address, size) => {
      HEAPU8.fill(0, address, address + size);
      return address;
    };
  
  var spawnThread = (threadParams) => {
  
      var worker = PThread.getNewWorker();
      if (!worker) {
        // No available workers in the PThread pool.
        return 6;
      }
  
      PThread.runningWorkers.push(worker);
  
      // Add to pthreads map
      PThread.pthreads[threadParams.pthread_ptr] = worker;
  
      worker.pthread_ptr = threadParams.pthread_ptr;
      var msg = {
          'cmd': 'run',
          'start_routine': threadParams.startRoutine,
          'arg': threadParams.arg,
          'pthread_ptr': threadParams.pthread_ptr,
      };
      if (ENVIRONMENT_IS_NODE) {
        // Mark worker as weakly referenced once we start executing a pthread,
        // so that its existence does not prevent Node.js from exiting.  This
        // has no effect if the worker is already weakly referenced (e.g. if
        // this worker was previously idle/unused).
        worker.unref();
      }
      // Ask the worker to start executing its pthread entry point function.
      worker.postMessage(msg, threadParams.transferList);
      return 0;
    };
  
  
  
  var runtimeKeepaliveCounter = 0;
  var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
  
  var PATH = {
  isAbs:(path) => path.charAt(0) === '/',
  splitPath:(filename) => {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },
  normalizeArray:(parts, allowAboveRoot) => {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift('..');
          }
        }
        return parts;
      },
  normalize:(path) => {
        var isAbsolute = PATH.isAbs(path),
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter((p) => !!p), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },
  dirname:(path) => {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },
  basename:(path) => {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        path = PATH.normalize(path);
        path = path.replace(/\/$/, "");
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },
  join:function() {
        var paths = Array.prototype.slice.call(arguments);
        return PATH.normalize(paths.join('/'));
      },
  join2:(l, r) => PATH.normalize(l + '/' + r),
  };
  
  var initRandomFill = () => {
      if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
        // for modern web browsers
        // like with most Web APIs, we can't use Web Crypto API directly on shared memory,
        // so we need to create an intermediate buffer and copy it to the destination
        return (view) => (
          view.set(crypto.getRandomValues(new Uint8Array(view.byteLength))),
          // Return the original view to match modern native implementations.
          view
        );
      } else
      if (ENVIRONMENT_IS_NODE) {
        // for nodejs with or without crypto support included
        try {
          var crypto_module = require('crypto');
          var randomFillSync = crypto_module['randomFillSync'];
          if (randomFillSync) {
            // nodejs with LTS crypto support
            return (view) => crypto_module['randomFillSync'](view);
          }
          // very old nodejs with the original crypto API
          var randomBytes = crypto_module['randomBytes'];
          return (view) => (
            view.set(randomBytes(view.byteLength)),
            // Return the original view to match modern native implementations.
            view
          );
        } catch (e) {
          // nodejs doesn't have crypto support
        }
      }
      // we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096
      abort("initRandomDevice");
    };
  var randomFill = (view) => {
      // Lazily init on the first invocation.
      return (randomFill = initRandomFill())(view);
    };
  
  
  
  var PATH_FS = {
  resolve:function() {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path != 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = PATH.isAbs(path);
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter((p) => !!p), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },
  relative:(from, to) => {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      },
  };
  
  
  var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
  
    /**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */
  var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.  Also, use the length info to avoid running tiny
      // strings through TextDecoder, since .subarray() allocates garbage.
      // (As a tiny code save trick, compare endPtr against endIdx using a negation,
      // so that undefined means Infinity)
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.buffer instanceof SharedArrayBuffer ? heapOrArray.slice(idx, endPtr) : heapOrArray.subarray(idx, endPtr));
      }
      var str = '';
      // If building with TextDecoder, we have already computed the string length
      // above, so test loop end condition against that
      while (idx < endPtr) {
        // For UTF8 byte structure, see:
        // http://en.wikipedia.org/wiki/UTF-8#Description
        // https://www.ietf.org/rfc/rfc2279.txt
        // https://tools.ietf.org/html/rfc3629
        var u0 = heapOrArray[idx++];
        if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 0xF0) == 0xE0) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
        }
  
        if (u0 < 0x10000) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 0x10000;
          str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        }
      }
      return str;
    };
  
  
  var PTY_signalNameToCode = {
  SIGINT:2,
  SIGQUIT:3,
  SIGTSTP:20,
  SIGWINCH:28,
  };
  var PTY = Module['pty'];
  
  var PTY_pollTimeout = 0;
  
  var PTY_askToWaitAgain = (timeout) => {
          PTY_pollTimeout = timeout;
          throw new FS.ErrnoError(1006);
      };
  var TTY = {
  ttys:[],
  init() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process.stdin.setEncoding('utf8');
        // }
      },
  shutdown() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process.stdin.pause();
        // }
      },
  register(dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },
  stream_ops:{
  open(stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(43);
          }
          stream.tty = tty;
          stream.seekable = false;
        },
  close(stream) {
          // flush any pending line data
          stream.tty.ops.fsync(stream.tty);
        },
  fsync(stream) {
          stream.tty.ops.fsync(stream.tty);
        },
  read:(stream, buffer, offset, length) => {
          let readBytes = PTY.read(length);
          if (length && !readBytes.length) {
              PTY_askToWaitAgain(-1);
          }
          buffer.set(readBytes, offset);
          return readBytes.length;
      },
  write:(stream, buffer, offset, length) => {
          // Note: default `buffer` is for some reason `HEAP8` (signed), while we want unsigned `HEAPU8`.
          if (buffer === HEAP8) {
              buffer = HEAPU8;
          } else if (!(buffer instanceof Uint8Array)) {
              throw new Error(`Unexpected buffer type: ${buffer.constructor.name}`);
          }
          PTY.write(Array.from(buffer.subarray(offset, offset + length)));
          return length;
      },
  poll:(stream, timeout) => {
          if (!PTY.readable && timeout) {
              PTY_askToWaitAgain(timeout);
          }
          return (PTY.readable ? 1 : 0) | (PTY.writable ? 4 : 0);
      },
  },
  default_tty_ops:{
  get_char:() => {
      },
  put_char:() => {
      },
  fsync:() => {},
  ioctl_tcgets:() => {
          const termios = PTY.ioctl('TCGETS');
          const data = {
              c_iflag: termios.iflag,
              c_oflag: termios.oflag,
              c_cflag: termios.cflag,
              c_lflag: termios.lflag,
              c_cc: termios.cc,
          }
          return data;
      },
  ioctl_tcsets:(_tty, _optional_actions, data) => {
          PTY.ioctl('TCSETS', {
              iflag: data.c_iflag,
              oflag: data.c_oflag,
              cflag: data.c_cflag,
              lflag: data.c_lflag,
              cc: data.c_cc,
          });
          return 0;
      },
  ioctl_tiocgwinsz:() => PTY.ioctl('TIOCGWINSZ').reverse(),
  },
  default_tty1_ops:{
  put_char:() => {
      },
  fsync:() => {},
  },
  };
  
  
  
  var alignMemory = (size, alignment) => {
      return Math.ceil(size / alignment) * alignment;
    };
  var mmapAlloc = (size) => {
      size = alignMemory(size, 65536);
      var ptr = _emscripten_builtin_memalign(65536, size);
      if (!ptr) return 0;
      return zeroMemory(ptr, size);
    };
  var MEMFS = {
  ops_table:null,
  mount(mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },
  createNode(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(63);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap,
                msync: MEMFS.stream_ops.msync
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            }
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
          parent.timestamp = node.timestamp;
        }
        return node;
      },
  getFileDataAsTypedArray(node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },
  expandFileStorage(node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
        // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
        // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
        // avoid overshooting the allocation cap by a very large margin.
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) >>> 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity); // Allocate new storage.
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
      },
  resizeFileStorage(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
        } else {
          var oldContents = node.contents;
          node.contents = new Uint8Array(newSize); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
        }
      },
  node_ops:{
  getattr(node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },
  setattr(node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },
  lookup(parent, name) {
          throw FS.genericErrors[44];
        },
  mknod(parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },
  rename(old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(55);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.parent.timestamp = Date.now()
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          new_dir.timestamp = old_node.parent.timestamp;
          old_node.parent = new_dir;
        },
  unlink(parent, name) {
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },
  rmdir(parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(55);
          }
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },
  readdir(node) {
          var entries = ['.', '..'];
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },
  symlink(parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },
  readlink(node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          return node.link;
        },
  },
  stream_ops:{
  read(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },
  write(stream, buffer, offset, length, position, canOwn) {
  
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) {
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = buffer.slice(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
  
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) {
            // Use typed array write which is available.
            node.contents.set(buffer.subarray(offset, offset + length), position);
          } else {
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position + length);
          return length;
        },
  llseek(stream, offset, whence) {
          var position = offset;
          if (whence === 1) {
            position += stream.position;
          } else if (whence === 2) {
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(28);
          }
          return position;
        },
  allocate(stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },
  mmap(stream, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if (!(flags & 2) && contents.buffer === HEAP8.buffer) {
            // We can't emulate MAP_SHARED when the file is not backed by the
            // buffer we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = mmapAlloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(48);
            }
            HEAP8.set(contents, ptr);
          }
          return { ptr, allocated };
        },
  msync(stream, buffer, offset, length, mmapFlags) {
          MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          // should we check if bytesWritten and length are the same?
          return 0;
        },
  },
  };
  
  /** @param {boolean=} noRunDep */
  var asyncLoad = (url, onload, onerror, noRunDep) => {
      var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : '';
      readAsync(url, (arrayBuffer) => {
        assert(arrayBuffer, `Loading data file "${url}" failed (no arrayBuffer).`);
        onload(new Uint8Array(arrayBuffer));
        if (dep) removeRunDependency(dep);
      }, (event) => {
        if (onerror) {
          onerror();
        } else {
          throw `Loading data file "${url}" failed.`;
        }
      });
      if (dep) addRunDependency(dep);
    };
  
  
  var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
      FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
    };
  
  var preloadPlugins = Module['preloadPlugins'] || [];
  var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
      // Ensure plugins are ready.
      if (typeof Browser != 'undefined') Browser.init();
  
      var handled = false;
      preloadPlugins.forEach((plugin) => {
        if (handled) return;
        if (plugin['canHandle'](fullname)) {
          plugin['handle'](byteArray, fullname, finish, onerror);
          handled = true;
        }
      });
      return handled;
    };
  var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
      // TODO we should allow people to just pass in a complete filename instead
      // of parent and name being that we just join them anyways
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
      var dep = getUniqueRunDependency(`cp ${fullname}`); // might have several active requests for the same fullname
      function processData(byteArray) {
        function finish(byteArray) {
          if (preFinish) preFinish();
          if (!dontCreateFile) {
            FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
          }
          if (onload) onload();
          removeRunDependency(dep);
        }
        if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
          if (onerror) onerror();
          removeRunDependency(dep);
        })) {
          return;
        }
        finish(byteArray);
      }
      addRunDependency(dep);
      if (typeof url == 'string') {
        asyncLoad(url, (byteArray) => processData(byteArray), onerror);
      } else {
        processData(url);
      }
    };
  
  var FS_modeStringToFlags = (str) => {
      var flagModes = {
        'r': 0,
        'r+': 2,
        'w': 512 | 64 | 1,
        'w+': 512 | 64 | 2,
        'a': 1024 | 64 | 1,
        'a+': 1024 | 64 | 2,
      };
      var flags = flagModes[str];
      if (typeof flags == 'undefined') {
        throw new Error(`Unknown file open mode: ${str}`);
      }
      return flags;
    };
  
  var FS_getMode = (canRead, canWrite) => {
      var mode = 0;
      if (canRead) mode |= 292 | 73;
      if (canWrite) mode |= 146;
      return mode;
    };
  
  var lengthBytesUTF8 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var c = str.charCodeAt(i); // possibly a lead surrogate
        if (c <= 0x7F) {
          len++;
        } else if (c <= 0x7FF) {
          len += 2;
        } else if (c >= 0xD800 && c <= 0xDFFF) {
          len += 4; ++i;
        } else {
          len += 3;
        }
      }
      return len;
    };
  
  var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
      // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
      // undefined and false each don't write out any bytes.
      if (!(maxBytesToWrite > 0))
        return 0;
  
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
        // and https://www.ietf.org/rfc/rfc2279.txt
        // and https://tools.ietf.org/html/rfc3629
        var u = str.charCodeAt(i); // possibly a lead surrogate
        if (u >= 0xD800 && u <= 0xDFFF) {
          var u1 = str.charCodeAt(++i);
          u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
        }
        if (u <= 0x7F) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 0x7FF) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 0xC0 | (u >> 6);
          heap[outIdx++] = 0x80 | (u & 63);
        } else if (u <= 0xFFFF) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 0xE0 | (u >> 12);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          heap[outIdx++] = 0xF0 | (u >> 18);
          heap[outIdx++] = 0x80 | ((u >> 12) & 63);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        }
      }
      // Null-terminate the pointer to the buffer.
      heap[outIdx] = 0;
      return outIdx - startIdx;
    };
  /** @type {function(string, boolean=, number=)} */
  function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array;
  }
  
  
  var FS = {
  root:null,
  mounts:[],
  devices:{
  },
  streams:[],
  nextInode:1,
  nameTable:null,
  currentPath:"/",
  initialized:false,
  ignorePermissions:true,
  ErrnoError:null,
  genericErrors:{
  },
  filesystems:null,
  syncFSRequests:0,
  lookupPath(path, opts = {}) {
        path = PATH_FS.resolve(path);
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        opts = Object.assign(defaults, opts)
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(32);
        }
  
        // split the absolute path
        var parts = path.split('/').filter((p) => !!p);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
  
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(32);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },
  getPath(node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? `${mount}/${path}` : mount + path;
          }
          path = path ? `${node.name}/${path}` : node.name;
          node = node.parent;
        }
      },
  hashName(parentid, name) {
        var hash = 0;
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },
  hashAddNode(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },
  hashRemoveNode(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },
  lookupNode(parent, name) {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
          throw new FS.ErrnoError(errCode, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },
  createNode(parent, name, mode, rdev) {
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },
  destroyNode(node) {
        FS.hashRemoveNode(node);
      },
  isRoot(node) {
        return node === node.parent;
      },
  isMountpoint(node) {
        return !!node.mounted;
      },
  isFile(mode) {
        return (mode & 61440) === 32768;
      },
  isDir(mode) {
        return (mode & 61440) === 16384;
      },
  isLink(mode) {
        return (mode & 61440) === 40960;
      },
  isChrdev(mode) {
        return (mode & 61440) === 8192;
      },
  isBlkdev(mode) {
        return (mode & 61440) === 24576;
      },
  isFIFO(mode) {
        return (mode & 61440) === 4096;
      },
  isSocket(mode) {
        return (mode & 49152) === 49152;
      },
  flagsToPermissionString(flag) {
        var perms = ['r', 'w', 'rw'][flag & 3];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },
  nodePermissions(node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.includes('r') && !(node.mode & 292)) {
          return 2;
        } else if (perms.includes('w') && !(node.mode & 146)) {
          return 2;
        } else if (perms.includes('x') && !(node.mode & 73)) {
          return 2;
        }
        return 0;
      },
  mayLookup(dir) {
        var errCode = FS.nodePermissions(dir, 'x');
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0;
      },
  mayCreate(dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return 20;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },
  mayDelete(dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var errCode = FS.nodePermissions(dir, 'wx');
        if (errCode) {
          return errCode;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return 54;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return 10;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return 31;
          }
        }
        return 0;
      },
  mayOpen(node, flags) {
        if (!node) {
          return 44;
        }
        if (FS.isLink(node.mode)) {
          return 32;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== 'r' || // opening for write
              (flags & 512)) { // TODO: check for O_SEARCH? (== search for dir only)
            return 31;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },
  MAX_OPEN_FDS:4096,
  nextfd() {
        for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(33);
      },
  getStreamChecked(fd) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        return stream;
      },
  getStream:(fd) => FS.streams[fd],
  createStream(stream, fd = -1) {
        if (!FS.FSStream) {
          FS.FSStream = /** @constructor */ function() {
            this.shared = { };
          };
          FS.FSStream.prototype = {};
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              /** @this {FS.FSStream} */
              get() { return this.node; },
              /** @this {FS.FSStream} */
              set(val) { this.node = val; }
            },
            isRead: {
              /** @this {FS.FSStream} */
              get() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              /** @this {FS.FSStream} */
              get() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              /** @this {FS.FSStream} */
              get() { return (this.flags & 1024); }
            },
            flags: {
              /** @this {FS.FSStream} */
              get() { return this.shared.flags; },
              /** @this {FS.FSStream} */
              set(val) { this.shared.flags = val; },
            },
            position : {
              /** @this {FS.FSStream} */
              get() { return this.shared.position; },
              /** @this {FS.FSStream} */
              set(val) { this.shared.position = val; },
            },
          });
        }
        // clone it, so we can return an instance of FSStream
        stream = Object.assign(new FS.FSStream(), stream);
        if (fd == -1) {
          fd = FS.nextfd();
        }
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },
  closeStream(fd) {
        FS.streams[fd] = null;
      },
  chrdev_stream_ops:{
  open(stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },
  llseek() {
          throw new FS.ErrnoError(70);
        },
  },
  major:(dev) => ((dev) >> 8),
  minor:(dev) => ((dev) & 0xff),
  makedev:(ma, mi) => ((ma) << 8 | (mi)),
  registerDevice(dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },
  getDevice:(dev) => FS.devices[dev],
  getMounts(mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },
  syncfs(populate, callback) {
        if (typeof populate == 'function') {
          callback = populate;
          populate = false;
        }
  
        FS.syncFSRequests++;
  
        if (FS.syncFSRequests > 1) {
          err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function doCallback(errCode) {
          FS.syncFSRequests--;
          return callback(errCode);
        }
  
        function done(errCode) {
          if (errCode) {
            if (!done.errored) {
              done.errored = true;
              return doCallback(errCode);
            }
            return;
          }
          if (++completed >= mounts.length) {
            doCallback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach((mount) => {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },
  mount(type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
        }
  
        var mount = {
          type,
          opts,
          mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },
  unmount(mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(28);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach((hash) => {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.includes(current.mount)) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        node.mount.mounts.splice(idx, 1);
      },
  lookup(parent, name) {
        return parent.node_ops.lookup(parent, name);
      },
  mknod(path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },
  create(path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },
  mkdir(path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },
  mkdirTree(path, mode) {
        var dirs = path.split('/');
        var d = '';
        for (var i = 0; i < dirs.length; ++i) {
          if (!dirs[i]) continue;
          d += '/' + dirs[i];
          try {
            FS.mkdir(d, mode);
          } catch(e) {
            if (e.errno != 20) throw e;
          }
        }
      },
  mkdev(path, mode, dev) {
        if (typeof dev == 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },
  symlink(oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
          throw new FS.ErrnoError(44);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },
  rename(old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
  
        // let the errors from non existant directories percolate up
        lookup = FS.lookupPath(old_path, { parent: true });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, { parent: true });
        new_dir = lookup.node;
  
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(75);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(28);
        }
        // new path should not be an ancestor of the old path
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(55);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        errCode = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(10);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          errCode = FS.nodePermissions(old_dir, 'w');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },
  rmdir(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },
  readdir(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(54);
        }
        return node.node_ops.readdir(node);
      },
  unlink(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
          // According to POSIX, we should map EISDIR to EPERM, but
          // we instead do what Linux does (and we must, as we use
          // the musl linux libc).
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },
  readlink(path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(28);
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
      },
  stat(path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(63);
        }
        return node.node_ops.getattr(node);
      },
  lstat(path) {
        return FS.stat(path, true);
      },
  chmod(path, mode, dontFollow) {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },
  lchmod(path, mode) {
        FS.chmod(path, mode, true);
      },
  fchmod(fd, mode) {
        var stream = FS.getStreamChecked(fd);
        FS.chmod(stream.node, mode);
      },
  chown(path, uid, gid, dontFollow) {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },
  lchown(path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },
  fchown(fd, uid, gid) {
        var stream = FS.getStreamChecked(fd);
        FS.chown(stream.node, uid, gid);
      },
  truncate(path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.nodePermissions(node, 'w');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },
  ftruncate(fd, len) {
        var stream = FS.getStreamChecked(fd);
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(28);
        }
        FS.truncate(stream.node, len);
      },
  utime(path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },
  open(path, flags, mode) {
        if (path === "") {
          throw new FS.ErrnoError(44);
        }
        flags = typeof flags == 'string' ? FS_modeStringToFlags(flags) : flags;
        mode = typeof mode == 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path == 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(20);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // if asked only for a directory, then this must be one
        if ((flags & 65536) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var errCode = FS.mayOpen(node, flags);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // do truncation if necessary
        if ((flags & 512) && !created) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512 | 131072);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        });
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
          }
        }
        return stream;
      },
  close(stream) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (stream.getdents) stream.getdents = null; // free readdir state
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
        stream.fd = null;
      },
  isClosed(stream) {
        return stream.fd === null;
      },
  llseek(stream, offset, whence) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
          throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },
  read(stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(28);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },
  write(stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },
  allocate(stream, offset, length) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(28);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(138);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },
  mmap(stream, length, position, prot, flags) {
        // User requests writing to file (prot & PROT_WRITE != 0).
        // Checking if we have permissions to write to the file unless
        // MAP_PRIVATE flag is set. According to POSIX spec it is possible
        // to write to file opened in read-only mode with MAP_PRIVATE flag,
        // as all modifications will be visible only in the memory of
        // the current process.
        if ((prot & 2) !== 0
            && (flags & 2) === 0
            && (stream.flags & 2097155) !== 2) {
          throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(43);
        }
        return stream.stream_ops.mmap(stream, length, position, prot, flags);
      },
  msync(stream, buffer, offset, length, mmapFlags) {
        if (!stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
      },
  munmap:(stream) => 0,
  ioctl(stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },
  readFile(path, opts = {}) {
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error(`Invalid encoding type "${opts.encoding}"`);
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },
  writeFile(path, data, opts = {}) {
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data == 'string') {
          var buf = new Uint8Array(lengthBytesUTF8(data)+1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
          throw new Error('Unsupported data type');
        }
        FS.close(stream);
      },
  cwd:() => FS.currentPath,
  chdir(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
          throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup.node, 'x');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
      },
  createDefaultDirectories() {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },
  createDefaultDevices() {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: () => 0,
          write: (stream, buffer, offset, length, pos) => length,
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using err() rather than out()
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        // use a buffer to avoid overhead of individual crypto calls per byte
        var randomBuffer = new Uint8Array(1024), randomLeft = 0;
        var randomByte = () => {
          if (randomLeft === 0) {
            randomLeft = randomFill(randomBuffer).byteLength;
          }
          return randomBuffer[--randomLeft];
        };
        FS.createDevice('/dev', 'random', randomByte);
        FS.createDevice('/dev', 'urandom', randomByte);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },
  createSpecialDirectories() {
        // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
        // name of the stream for fd 6 (see test_unistd_ttyname)
        FS.mkdir('/proc');
        var proc_self = FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount({
          mount() {
            var node = FS.createNode(proc_self, 'fd', 16384 | 511 /* 0777 */, 73);
            node.node_ops = {
              lookup(parent, name) {
                var fd = +name;
                var stream = FS.getStreamChecked(fd);
                var ret = {
                  parent: null,
                  mount: { mountpoint: 'fake' },
                  node_ops: { readlink: () => stream.path },
                };
                ret.parent = ret; // make it look like a simple root node
                return ret;
              }
            };
            return node;
          }
        }, {}, '/proc/self/fd');
      },
  createStandardStreams() {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 0);
        var stdout = FS.open('/dev/stdout', 1);
        var stderr = FS.open('/dev/stderr', 1);
      },
  ensureErrnoError() {
        if (FS.ErrnoError) return;
        FS.ErrnoError = /** @this{Object} */ function ErrnoError(errno, node) {
          // We set the `name` property to be able to identify `FS.ErrnoError`
          // - the `name` is a standard ECMA-262 property of error objects. Kind of good to have it anyway.
          // - when using PROXYFS, an error can come from an underlying FS
          // as different FS objects have their own FS.ErrnoError each,
          // the test `err instanceof FS.ErrnoError` won't detect an error coming from another filesystem, causing bugs.
          // we'll use the reliable test `err.name == "ErrnoError"` instead
          this.name = 'ErrnoError';
          this.node = node;
          this.setErrno = /** @this{Object} */ function(errno) {
            this.errno = errno;
          };
          this.setErrno(errno);
          this.message = 'FS error';
  
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [44].forEach((code) => {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },
  staticInit() {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
  
        FS.filesystems = {
          'MEMFS': MEMFS,
        };
      },
  init(input, output, error) {
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },
  quit() {
        FS.init.initialized = false;
        // force-flush all streams, so we get musl std streams printed out
        // close all of our streams
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },
  findObject(path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (!ret.exists) {
          return null;
        }
        return ret.object;
      },
  analyzePath(path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },
  createPath(parent, path, canRead, canWrite) {
        parent = typeof parent == 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },
  createFile(parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS_getMode(canRead, canWrite);
        return FS.create(path, mode);
      },
  createDataFile(parent, name, data, canRead, canWrite, canOwn) {
        var path = name;
        if (parent) {
          parent = typeof parent == 'string' ? parent : FS.getPath(parent);
          path = name ? PATH.join2(parent, name) : parent;
        }
        var mode = FS_getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data == 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 577);
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
      },
  createDevice(parent, name, input, output) {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS_getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open(stream) {
            stream.seekable = false;
          },
          close(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },
  forceLoadFile(obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        if (typeof XMLHttpRequest != 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (read_) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(read_(obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
      },
  createLazyFile(parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        /** @constructor */
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = /** @this{Object} */ function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize)|0;
          return this.getter(chunkNum)[chunkOffset];
        };
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        };
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
  
          var chunkSize = 1024*1024; // Chunk size in bytes
  
          if (!hasByteServing) chunkSize = datalength;
  
          // Function to get a range from the remote URL.
          var doXHR = (from, to) => {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
            // Some hints to the browser that we want binary data.
            xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
  
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(/** @type{Array<number>} */(xhr.response || []));
            }
            return intArrayFromString(xhr.responseText || '', true);
          };
          var lazyArray = this;
          lazyArray.setDataGetter((chunkNum) => {
            var start = chunkNum * chunkSize;
            var end = (chunkNum+1) * chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof lazyArray.chunks[chunkNum] == 'undefined') throw new Error('doXHR failed!');
            return lazyArray.chunks[chunkNum];
          });
  
          if (usesGzip || !datalength) {
            // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
            chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
            datalength = this.getter(0).length;
            chunkSize = datalength;
            out("LazyFiles on gzip forces download of the whole file when length is accessed");
          }
  
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        };
        if (typeof XMLHttpRequest != 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperties(lazyArray, {
            length: {
              get: /** @this{Object} */ function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._length;
              }
            },
            chunkSize: {
              get: /** @this{Object} */ function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._chunkSize;
              }
            }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperties(node, {
          usedBytes: {
            get: /** @this {FSNode} */ function() { return this.contents.length; }
          }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach((key) => {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            FS.forceLoadFile(node);
            return fn.apply(null, arguments);
          };
        });
        function writeChunks(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        }
        // use a custom read function
        stream_ops.read = (stream, buffer, offset, length, position) => {
          FS.forceLoadFile(node);
          return writeChunks(stream, buffer, offset, length, position)
        };
        // use a custom mmap function
        stream_ops.mmap = (stream, length, position, prot, flags) => {
          FS.forceLoadFile(node);
          var ptr = mmapAlloc(length);
          if (!ptr) {
            throw new FS.ErrnoError(48);
          }
          writeChunks(stream, HEAP8, ptr, length, position);
          return { ptr, allocated: true };
        };
        node.stream_ops = stream_ops;
        return node;
      },
  };
  
  
    /**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */
  var UTF8ToString = (ptr, maxBytesToRead) => {
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    };
  var SYSCALLS = {
  DEFAULT_POLLMASK:5,
  calculateAt(dirfd, path, allowEmpty) {
        if (PATH.isAbs(path)) {
          return path;
        }
        // relative path
        var dir;
        if (dirfd === -100) {
          dir = FS.cwd();
        } else {
          var dirstream = SYSCALLS.getStreamFromFD(dirfd);
          dir = dirstream.path;
        }
        if (path.length == 0) {
          if (!allowEmpty) {
            throw new FS.ErrnoError(44);;
          }
          return dir;
        }
        return PATH.join2(dir, path);
      },
  doStat(func, path, buf) {
        try {
          var stat = func(path);
        } catch (e) {
          if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
            // an error occurred while trying to look up the path; we should just report ENOTDIR
            return -54;
          }
          throw e;
        }
        HEAP32[((buf)>>2)] = stat.dev;
        HEAP32[(((buf)+(4))>>2)] = stat.mode;
        HEAPU32[(((buf)+(8))>>2)] = stat.nlink;
        HEAP32[(((buf)+(12))>>2)] = stat.uid;
        HEAP32[(((buf)+(16))>>2)] = stat.gid;
        HEAP32[(((buf)+(20))>>2)] = stat.rdev;
        HEAP64[(((buf)+(24))>>3)] = BigInt(stat.size);
        HEAP32[(((buf)+(32))>>2)] = 4096;
        HEAP32[(((buf)+(36))>>2)] = stat.blocks;
        var atime = stat.atime.getTime();
        var mtime = stat.mtime.getTime();
        var ctime = stat.ctime.getTime();
        HEAP64[(((buf)+(40))>>3)] = BigInt(Math.floor(atime / 1000));
        HEAPU32[(((buf)+(48))>>2)] = (atime % 1000) * 1000;
        HEAP64[(((buf)+(56))>>3)] = BigInt(Math.floor(mtime / 1000));
        HEAPU32[(((buf)+(64))>>2)] = (mtime % 1000) * 1000;
        HEAP64[(((buf)+(72))>>3)] = BigInt(Math.floor(ctime / 1000));
        HEAPU32[(((buf)+(80))>>2)] = (ctime % 1000) * 1000;
        HEAP64[(((buf)+(88))>>3)] = BigInt(stat.ino);
        return 0;
      },
  doMsync(addr, stream, len, flags, offset) {
        if (!FS.isFile(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (flags & 2) {
          // MAP_PRIVATE calls need not to be synced back to underlying fs
          return 0;
        }
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
      },
  varargs:undefined,
  get() {
        // the `+` prepended here is necessary to convince the JSCompiler that varargs is indeed a number.
        var ret = HEAP32[((+SYSCALLS.varargs)>>2)];
        SYSCALLS.varargs += 4;
        return ret;
      },
  getp() { return SYSCALLS.get() },
  getStr(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
  getStreamFromFD(fd) {
        var stream = FS.getStreamChecked(fd);
        return stream;
      },
  };
  
  var withStackSave = (f) => {
      var stack = stackSave();
      var ret = f();
      stackRestore(stack);
      return ret;
    };
  
  
  var MAX_INT53 = 9007199254740992;
  
  var MIN_INT53 = -9007199254740992;
  var bigintToI53Checked = (num) => (num < MIN_INT53 || num > MAX_INT53) ? NaN : Number(num);
  
  /** @type{function(number, (number|boolean), ...(number|boolean))} */
  var proxyToMainThread = function(index, sync) {
      // Additional arguments are passed after those two, which are the actual
      // function arguments.
      // The serialization buffer contains the number of call params, and then
      // all the args here.
      // We also pass 'sync' to C separately, since C needs to look at it.
      var numCallArgs = arguments.length - 2;
      var outerArgs = arguments;
      // Allocate a buffer, which will be copied by the C code.
      return withStackSave(() => {
        // First passed parameter specifies the number of arguments to the function.
        // When BigInt support is enabled, we must handle types in a more complex
        // way, detecting at runtime if a value is a BigInt or not (as we have no
        // type info here). To do that, add a "prefix" before each value that
        // indicates if it is a BigInt, which effectively doubles the number of
        // values we serialize for proxying. TODO: pack this?
        var serializedNumCallArgs = numCallArgs * 2;
        var args = stackAlloc(serializedNumCallArgs * 8);
        var b = ((args)>>3);
        for (var i = 0; i < numCallArgs; i++) {
          var arg = outerArgs[2 + i];
          if (typeof arg == 'bigint') {
            // The prefix is non-zero to indicate a bigint.
            HEAP64[b + 2*i] = 1n;
            HEAP64[b + 2*i + 1] = arg;
          } else {
            // The prefix is zero to indicate a JS Number.
            HEAP64[b + 2*i] = 0n;
            HEAPF64[b + 2*i + 1] = arg;
          }
        }
        return __emscripten_run_on_main_thread_js(index, serializedNumCallArgs, args, sync);
      });
    };
  
  function _proc_exit(code) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(0, 1, code);
  
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        PThread.terminateAllThreads();
        if (Module['onExit']) Module['onExit'](code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    
  }
  
  /** @suppress {duplicate } */
  /** @param {boolean|number=} implicit */
  var exitJS = (status, implicit) => {
      EXITSTATUS = status;
  
      if (ENVIRONMENT_IS_PTHREAD) {
        // implict exit can never happen on a pthread
        // When running in a pthread we propagate the exit back to the main thread
        // where it can decide if the whole process should be shut down or not.
        // The pthread may have decided not to exit its own runtime, for example
        // because it runs a main loop, but that doesn't affect the main thread.
        exitOnMainThread(status);
        throw 'unwind';
      }
  
      _proc_exit(status);
    };
  var _exit = exitJS;
  
  var handleException = (e) => {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      quit_(1, e);
    };
  
  var PThread = {
  unusedWorkers:[],
  runningWorkers:[],
  tlsInitFunctions:[],
  pthreads:{
  },
  init() {
        if (ENVIRONMENT_IS_PTHREAD
          ) {
          PThread.initWorker();
        } else {
          PThread.initMainThread();
        }
      },
  initMainThread() {
        var pthreadPoolSize = 4;
        // Start loading up the Worker pool, if requested.
        while (pthreadPoolSize--) {
          PThread.allocateUnusedWorker();
        }
        // MINIMAL_RUNTIME takes care of calling loadWasmModuleToAllWorkers
        // in postamble_minimal.js
        addOnPreRun(() => {
          addRunDependency('loading-workers')
          PThread.loadWasmModuleToAllWorkers(() => removeRunDependency('loading-workers'));
        });
      },
  initWorker() {
        // worker.js is not compiled together with us, and must access certain
        // things.
        PThread['receiveObjectTransfer'] = PThread.receiveObjectTransfer;
        PThread['threadInitTLS'] = PThread.threadInitTLS;
        PThread['setExitStatus'] = PThread.setExitStatus;
  
        // The default behaviour for pthreads is always to exit once they return
        // from their entry point (or call pthread_exit).  If we set noExitRuntime
        // to true here on pthreads they would never complete and attempt to
        // pthread_join to them would block forever.
        // pthreads can still choose to set `noExitRuntime` explicitly, or
        // call emscripten_unwind_to_js_event_loop to extend their lifetime beyond
        // their main function.  See comment in src/worker.js for more.
        noExitRuntime = false;
      },
  setExitStatus:(status) => {
        EXITSTATUS = status;
      },
  terminateAllThreads__deps:["$terminateWorker"],
  terminateAllThreads:() => {
        // Attempt to kill all workers.  Sadly (at least on the web) there is no
        // way to terminate a worker synchronously, or to be notified when a
        // worker in actually terminated.  This means there is some risk that
        // pthreads will continue to be executing after `worker.terminate` has
        // returned.  For this reason, we don't call `returnWorkerToPool` here or
        // free the underlying pthread data structures.
        for (var worker of PThread.runningWorkers) {
          terminateWorker(worker);
        }
        for (var worker of PThread.unusedWorkers) {
          terminateWorker(worker);
        }
        PThread.unusedWorkers = [];
        PThread.runningWorkers = [];
        PThread.pthreads = [];
      },
  returnWorkerToPool:(worker) => {
        // We don't want to run main thread queued calls here, since we are doing
        // some operations that leave the worker queue in an invalid state until
        // we are completely done (it would be bad if free() ends up calling a
        // queued pthread_create which looks at the global data structures we are
        // modifying). To achieve that, defer the free() til the very end, when
        // we are all done.
        var pthread_ptr = worker.pthread_ptr;
        delete PThread.pthreads[pthread_ptr];
        // Note: worker is intentionally not terminated so the pool can
        // dynamically grow.
        PThread.unusedWorkers.push(worker);
        PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
        // Not a running Worker anymore
        // Detach the worker from the pthread object, and return it to the
        // worker pool as an unused worker.
        worker.pthread_ptr = 0;
  
        if (ENVIRONMENT_IS_NODE) {
          // Once the proxied main thread has finished, mark it as weakly
          // referenced so that its existence does not prevent Node.js from
          // exiting.  This has no effect if the worker is already weakly
          // referenced.
          worker.unref();
        }
  
        // Finally, free the underlying (and now-unused) pthread structure in
        // linear memory.
        __emscripten_thread_free_data(pthread_ptr);
      },
  receiveObjectTransfer(data) {
      },
  threadInitTLS() {
        // Call thread init functions (these are the _emscripten_tls_init for each
        // module loaded.
        PThread.tlsInitFunctions.forEach((f) => f());
      },
  loadWasmModuleToWorker:(worker) => new Promise((onFinishedLoading) => {
        worker.onmessage = (e) => {
          var d = e['data'];
          var cmd = d['cmd'];
  
          // If this message is intended to a recipient that is not the main
          // thread, forward it to the target thread.
          if (d['targetThread'] && d['targetThread'] != _pthread_self()) {
            var targetWorker = PThread.pthreads[d['targetThread']];
            if (targetWorker) {
              targetWorker.postMessage(d, d['transferList']);
            } else {
              err(`Internal error! Worker sent a message "${cmd}" to target pthread ${d['targetThread']}, but that thread no longer exists!`);
            }
            return;
          }
  
          if (cmd === 'checkMailbox') {
            checkMailbox();
          } else if (cmd === 'spawnThread') {
            spawnThread(d);
          } else if (cmd === 'cleanupThread') {
            cleanupThread(d['thread']);
          } else if (cmd === 'killThread') {
            killThread(d['thread']);
          } else if (cmd === 'cancelThread') {
            cancelThread(d['thread']);
          } else if (cmd === 'loaded') {
            worker.loaded = true;
            // Check that this worker doesn't have an associated pthread.
            if (ENVIRONMENT_IS_NODE && !worker.pthread_ptr) {
              // Once worker is loaded & idle, mark it as weakly referenced,
              // so that mere existence of a Worker in the pool does not prevent
              // Node.js from exiting the app.
              worker.unref();
            }
            onFinishedLoading(worker);
          } else if (cmd === 'alert') {
            alert(`Thread ${d['threadId']}: ${d['text']}`);
          } else if (d.target === 'setimmediate') {
            // Worker wants to postMessage() to itself to implement setImmediate()
            // emulation.
            worker.postMessage(d);
          } else if (cmd === 'callHandler') {
            Module[d['handler']](...d['args']);
          } else if (cmd) {
            // The received message looks like something that should be handled by this message
            // handler, (since there is a e.data.cmd field present), but is not one of the
            // recognized commands:
            err(`worker sent an unknown command ${cmd}`);
          }
        };
  
        worker.onerror = (e) => {
          var message = 'worker sent an error!';
          err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
          throw e;
        };
  
        if (ENVIRONMENT_IS_NODE) {
          worker.on('message', (data) => worker.onmessage({ data: data }));
          worker.on('error', (e) => worker.onerror(e));
        }
  
        // When running on a pthread, none of the incoming parameters on the module
        // object are present. Proxy known handlers back to the main thread if specified.
        var handlers = [];
        var knownHandlers = [
          'onExit',
          'onAbort',
          'print',
          'printErr',
        ];
        for (var handler of knownHandlers) {
          if (Module.hasOwnProperty(handler)) {
            handlers.push(handler);
          }
        }
  
        // Ask the new worker to load up the Emscripten-compiled page. This is a heavy operation.
        worker.postMessage({
          'cmd': 'load',
          'handlers': handlers,
          // If the application main .js file was loaded from a Blob, then it is not possible
          // to access the URL of the current script that could be passed to a Web Worker so that
          // it could load up the same file. In that case, developer must either deliver the Blob
          // object in Module['mainScriptUrlOrBlob'], or a URL to it, so that pthread Workers can
          // independently load up the same main application file.
          'urlOrBlob': Module['mainScriptUrlOrBlob']
          ,
          'wasmMemory': wasmMemory,
          'wasmModule': wasmModule,
        });
      }),
  loadWasmModuleToAllWorkers(onMaybeReady) {
        // Instantiation is synchronous in pthreads.
        if (
          ENVIRONMENT_IS_PTHREAD
        ) {
          return onMaybeReady();
        }
  
        let pthreadPoolReady = Promise.all(PThread.unusedWorkers.map(PThread.loadWasmModuleToWorker));
        pthreadPoolReady.then(onMaybeReady);
      },
  allocateUnusedWorker() {
        var worker;
        // If we're using module output and there's no explicit override, use bundler-friendly pattern.
        if (!Module['locateFile']) {
          worker = new Worker(new URL('qemu-system-aarch64.worker.js', import.meta.url), {type: 'module'});
        } else {
        // Allow HTML module to configure the location where the 'worker.js' file will be loaded from,
        // via Module.locateFile() function. If not specified, then the default URL 'worker.js' relative
        // to the main html file is loaded.
        var pthreadMainJs = locateFile('qemu-system-aarch64.worker.js');
        worker = new Worker(pthreadMainJs, {type: 'module'});
      }
      PThread.unusedWorkers.push(worker);
      },
  getNewWorker() {
        if (PThread.unusedWorkers.length == 0) {
  // PTHREAD_POOL_SIZE_STRICT should show a warning and, if set to level `2`, return from the function.
          PThread.allocateUnusedWorker();
          PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0]);
        }
        return PThread.unusedWorkers.pop();
      },
  };
  Module['PThread'] = PThread;

  var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    };

  var establishStackSpace = () => {
      var pthread_ptr = _pthread_self();
      var stackHigh = HEAPU32[(((pthread_ptr)+(52))>>2)];
      var stackSize = HEAPU32[(((pthread_ptr)+(56))>>2)];
      var stackLow = stackHigh - stackSize;
      // Set stack limits used by `emscripten/stack.h` function.  These limits are
      // cached in wasm-side globals to make checks as fast as possible.
      _emscripten_stack_set_limits(stackHigh, stackLow);
  
      // Call inside wasm module to set up the stack frame for this pthread in wasm module scope
      stackRestore(stackHigh);
  
    };
  Module['establishStackSpace'] = establishStackSpace;

  
  
  
  
  var runtimeKeepalivePop = () => {
      runtimeKeepaliveCounter -= 1;
    };
  
  function exitOnMainThread(returnCode) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(1, 0, returnCode);
  
      runtimeKeepalivePop();;
      _exit(returnCode);
    
  }
  

  
    /**
     * @param {number} ptr
     * @param {string} type
     */
  function getValue(ptr, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP64[((ptr)>>3)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      case '*': return HEAPU32[((ptr)>>2)];
      default: abort(`invalid type for getValue: ${type}`);
    }
  }

  
  
  var invokeEntryPoint = (ptr, arg) => {
  
      // pthread entry points are always of signature 'void *ThreadMain(void *arg)'
      // Native codebases sometimes spawn threads with other thread entry point
      // signatures, such as void ThreadMain(void *arg), void *ThreadMain(), or
      // void ThreadMain().  That is not acceptable per C/C++ specification, but
      // x86 compiler ABI extensions enable that to work. If you find the
      // following line to crash, either change the signature to "proper" void
      // *ThreadMain(void *arg) form, or try linking with the Emscripten linker
      // flag -sEMULATE_FUNCTION_POINTER_CASTS to add in emulation for this x86
      // ABI extension.
      var result = ((a1) => dynCall_ii.apply(null, [ptr, a1]))(arg);
      function finish(result) {
        if (keepRuntimeAlive()) {
          PThread.setExitStatus(result);
        } else {
          __emscripten_thread_exit(result);
        }
      }
      finish(result);
    };
  Module['invokeEntryPoint'] = invokeEntryPoint;

  var noExitRuntime = Module['noExitRuntime'] || true;

  var registerTLSInit = (tlsInitFunc) => {
      PThread.tlsInitFunctions.push(tlsInitFunc);
    };

  var runtimeKeepalivePush = () => {
      runtimeKeepaliveCounter += 1;
    };

  
    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
  function setValue(ptr, value, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': HEAP8[((ptr)>>0)] = value; break;
      case 'i8': HEAP8[((ptr)>>0)] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': HEAP64[((ptr)>>3)] = BigInt(value); break;
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      case '*': HEAPU32[((ptr)>>2)] = value; break;
      default: abort(`invalid type for setValue: ${type}`);
    }
  }

  var ___assert_fail = (condition, filename, line, func) => {
      abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']);
    };

  var ___call_sighandler = (fp, sig) => ((a1) => dynCall_vi.apply(null, [fp, a1]))(sig);

  var ___emscripten_init_main_thread_js = (tb) => {
      // Pass the thread address to the native code where they stored in wasm
      // globals which act as a form of TLS. Global constructors trying
      // to access this value will read the wrong value, but that is UB anyway.
      __emscripten_thread_init(
        tb,
        /*is_main=*/!ENVIRONMENT_IS_WORKER,
        /*is_runtime=*/1,
        /*can_block=*/!ENVIRONMENT_IS_WEB,
        /*default_stacksize=*/65536,
        /*start_profiling=*/false,
      );
      PThread.threadInitTLS();
    };

  var ___emscripten_thread_cleanup = (thread) => {
      // Called when a thread needs to be cleaned up so it can be reused.
      // A thread is considered reusable when it either returns from its
      // entry point, calls pthread_exit, or acts upon a cancellation.
      // Detached threads are responsible for calling this themselves,
      // otherwise pthread_join is responsible for calling this.
      if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread);
      else postMessage({ 'cmd': 'cleanupThread', 'thread': thread });
    };

  
  
  
  
  
  function pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(2, 1, pthread_ptr, attr, startRoutine, arg);
  return ___pthread_create_js(pthread_ptr, attr, startRoutine, arg)
  }
  
  
  var ___pthread_create_js = (pthread_ptr, attr, startRoutine, arg) => {
      if (typeof SharedArrayBuffer == 'undefined') {
        err('Current environment does not support SharedArrayBuffer, pthreads are not available!');
        return 6;
      }
  
      // List of JS objects that will transfer ownership to the Worker hosting the thread
      var transferList = [];
      var error = 0;
  
      // Synchronously proxy the thread creation to main thread if possible. If we
      // need to transfer ownership of objects, then proxy asynchronously via
      // postMessage.
      if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
        return pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg);
      }
  
      // If on the main thread, and accessing Canvas/OffscreenCanvas failed, abort
      // with the detected error.
      if (error) return error;
  
      var threadParams = {
        startRoutine,
        pthread_ptr,
        arg,
        transferList,
      };
  
      if (ENVIRONMENT_IS_PTHREAD) {
        // The prepopulated pool of web workers that can host pthreads is stored
        // in the main JS thread. Therefore if a pthread is attempting to spawn a
        // new thread, the thread creation must be deferred to the main JS thread.
        threadParams.cmd = 'spawnThread';
        postMessage(threadParams, transferList);
        // When we defer thread creation this way, we have no way to detect thread
        // creation synchronously today, so we have to assume success and return 0.
        return 0;
      }
  
      // We are the main thread, so we have the pthread warmup pool in this
      // thread and can fire off JS thread creation directly ourselves.
      return spawnThread(threadParams);
    };

  var ___pthread_kill_js = (thread, signal) => {
      if (signal === 33) { // Used by pthread_cancel in musl
        if (!ENVIRONMENT_IS_PTHREAD) cancelThread(thread);
        else postMessage({ 'cmd': 'cancelThread', 'thread': thread });
      } else {
        if (!ENVIRONMENT_IS_PTHREAD) killThread(thread);
        else postMessage({ 'cmd': 'killThread', 'thread': thread });
      }
      return 0;
    };

  var SOCKFS = {
  mount(mount) {
        // If Module['websocket'] has already been defined (e.g. for configuring
        // the subprotocol/url) use that, if not initialise it to a new object.
        Module['websocket'] = (Module['websocket'] &&
                               ('object' === typeof Module['websocket'])) ? Module['websocket'] : {};
  
        // Add the Event registration mechanism to the exported websocket configuration
        // object so we can register network callbacks from native JavaScript too.
        // For more documentation see system/include/emscripten/emscripten.h
        Module['websocket']._callbacks = {};
        Module['websocket']['on'] = /** @this{Object} */ function(event, callback) {
          if ('function' === typeof callback) {
            this._callbacks[event] = callback;
          }
          return this;
        };
  
        Module['websocket'].emit = /** @this{Object} */ function(event, param) {
          if ('function' === typeof this._callbacks[event]) {
            this._callbacks[event].call(this, param);
          }
        };
  
        // If debug is enabled register simple default logging callbacks for each Event.
  
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },
  createSocket(family, type, protocol) {
        type &= ~526336; // Some applications may pass it; it makes no sense for a single process.
        var streaming = type == 1;
        if (streaming && protocol && protocol != 6) {
          throw new FS.ErrnoError(66); // if SOCK_STREAM, must be tcp or 0.
        }
  
        // create our internal socket structure
        var sock = {
          family,
          type,
          protocol,
          server: null,
          error: null, // Used in getsockopt for SOL_SOCKET/SO_ERROR test
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node,
          flags: 2,
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },
  getSocket(fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },
  stream_ops:{
  poll(stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },
  ioctl(stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },
  read(stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },
  write(stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },
  close(stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        },
  },
  nextname() {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },
  websocket_sock_ops:{
  createPeer(sock, addr, port) {
          var ws;
  
          if (typeof addr == 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces '//' comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the '#' for '//' again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                var parts = addr.split('/');
                url = url + parts[0] + ":" + port + "/" + parts.slice(1).join('/');
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The default WebSocket options
              var opts = undefined;
  
              if (subProtocols !== 'null') {
                // The regex trims the string (removes spaces at the beginning and end, then splits the string by
                // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
                subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
                opts = subProtocols;
              }
  
              // some webservers (azure) does not support subprotocol header
              if (runtimeConfig && null === Module['websocket']['subprotocol']) {
                subProtocols = 'null';
                opts = undefined;
              }
  
              // If node we use the ws library.
              var WebSocketConstructor;
              if (ENVIRONMENT_IS_NODE) {
                WebSocketConstructor = /** @type{(typeof WebSocket)} */(require('ws'));
              } else
              {
                WebSocketConstructor = WebSocket;
              }
              ws = new WebSocketConstructor(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(23);
            }
          }
  
          var peer = {
            addr,
            port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport != 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },
  getPeer(sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },
  addPeer(sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },
  removePeer(sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },
  handlePeerEvents(sock, peer) {
          var first = true;
  
          var handleOpen = function () {
  
            Module['websocket'].emit('open', sock.stream.fd);
  
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            if (typeof data == 'string') {
              var encoder = new TextEncoder(); // should be utf-8
              data = encoder.encode(data); // make a typed array from the string
            } else {
              assert(data.byteLength !== undefined); // must receive an ArrayBuffer
              if (data.byteLength == 0) {
                // An empty ArrayBuffer will emit a pseudo disconnect event
                // as recv/recvmsg will return zero which indicates that a socket
                // has performed a shutdown although the connection has not been disconnected yet.
                return;
              }
              data = new Uint8Array(data); // make a typed array view on the array buffer
            }
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
            Module['websocket'].emit('message', sock.stream.fd);
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, isBinary) {
              if (!isBinary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer); // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('close', function() {
              Module['websocket'].emit('close', sock.stream.fd);
            });
            peer.socket.on('error', function(error) {
              // Although the ws library may pass errors that may be more descriptive than
              // ECONNREFUSED they are not necessarily the expected error code e.g.
              // ENOTFOUND on getaddrinfo seems to be node.js specific, so using ECONNREFUSED
              // is still probably the most useful thing to do.
              sock.error = 14; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
              Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'ECONNREFUSED: Connection refused']);
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onclose = function() {
              Module['websocket'].emit('close', sock.stream.fd);
            };
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
            peer.socket.onerror = function(error) {
              // The WebSocket spec only allows a 'simple event' to be thrown on error,
              // so we only really know as much as ECONNREFUSED.
              sock.error = 14; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
              Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'ECONNREFUSED: Connection refused']);
            };
          }
        },
  poll(sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },
  ioctl(sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)] = bytes;
              return 0;
            default:
              return 28;
          }
        },
  close(sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },
  bind(sock, addr, port) {
          if (typeof sock.saddr != 'undefined' || typeof sock.sport != 'undefined') {
            throw new FS.ErrnoError(28);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port;
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e.name === 'ErrnoError')) throw e;
              if (e.errno !== 138) throw e;
            }
          }
        },
  connect(sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(138);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr != 'undefined' && typeof sock.dport != 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(7);
              } else {
                throw new FS.ErrnoError(30);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(26);
        },
  listen(sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(138);
          }
          if (sock.server) {
             throw new FS.ErrnoError(28);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host,
            port: sock.sport
            // TODO support backlog
          });
          Module['websocket'].emit('listen', sock.stream.fd); // Send Event with listen fd.
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
              Module['websocket'].emit('connection', newsock.stream.fd);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
              Module['websocket'].emit('connection', sock.stream.fd);
            }
          });
          sock.server.on('close', function() {
            Module['websocket'].emit('close', sock.stream.fd);
            sock.server = null;
          });
          sock.server.on('error', function(error) {
            // Although the ws library may pass errors that may be more descriptive than
            // ECONNREFUSED they are not necessarily the expected error code e.g.
            // ENOTFOUND on getaddrinfo seems to be node.js specific, so using EHOSTUNREACH
            // is still probably the most useful thing to do. This error shouldn't
            // occur in a well written app as errors should get trapped in the compiled
            // app's own getaddrinfo call.
            sock.error = 23; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
            Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'EHOSTUNREACH: Host is unreachable']);
            // don't throw
          });
        },
  accept(listensock) {
          if (!listensock.server || !listensock.pending.length) {
            throw new FS.ErrnoError(28);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },
  getname(sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(53);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr, port };
        },
  sendmsg(sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(17);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(53);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(6);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          if (ArrayBuffer.isView(buffer)) {
            offset += buffer.byteOffset;
            buffer = buffer.buffer;
          }
  
          var data;
          // WebSockets .send() does not allow passing a SharedArrayBuffer, so clone the portion of the SharedArrayBuffer as a regular
          // ArrayBuffer that we want to send.
          if (buffer instanceof SharedArrayBuffer) {
            data = new Uint8Array(new Uint8Array(buffer.slice(offset, offset + length))).buffer;
          } else {
            data = buffer.slice(offset, offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(28);
          }
        },
  recvmsg(sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(53);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(53);
              }
              if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              // else, our socket is in a valid state but truly has nothing available
              throw new FS.ErrnoError(6);
            }
            throw new FS.ErrnoError(6);
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        },
  },
  };
  
  var getSocketFromFD = (fd) => {
      var socket = SOCKFS.getSocket(fd);
      if (!socket) throw new FS.ErrnoError(8);
      return socket;
    };
  
  var setErrNo = (value) => {
      HEAP32[((___errno_location())>>2)] = value;
      return value;
    };
  var Sockets = {
  BUFFER_SIZE:10240,
  MAX_BUFFER_SIZE:10485760,
  nextFd:1,
  fds:{
  },
  nextport:1,
  maxport:65535,
  peer:null,
  connections:{
  },
  portmap:{
  },
  localAddr:4261412874,
  addrPool:[33554442,50331658,67108874,83886090,100663306,117440522,134217738,150994954,167772170,184549386,201326602,218103818,234881034],
  };
  
  var inetPton4 = (str) => {
      var b = str.split('.');
      for (var i = 0; i < 4; i++) {
        var tmp = Number(b[i]);
        if (isNaN(tmp)) return null;
        b[i] = tmp;
      }
      return (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0;
    };
  
  
  /** @suppress {checkTypes} */
  var jstoi_q = (str) => parseInt(str);
  var inetPton6 = (str) => {
      var words;
      var w, offset, z, i;
      /* http://home.deds.nl/~aeron/regex/ */
      var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i
      var parts = [];
      if (!valid6regx.test(str)) {
        return null;
      }
      if (str === "::") {
        return [0, 0, 0, 0, 0, 0, 0, 0];
      }
      // Z placeholder to keep track of zeros when splitting the string on ":"
      if (str.startsWith("::")) {
        str = str.replace("::", "Z:"); // leading zeros case
      } else {
        str = str.replace("::", ":Z:");
      }
  
      if (str.indexOf(".") > 0) {
        // parse IPv4 embedded stress
        str = str.replace(new RegExp('[.]', 'g'), ":");
        words = str.split(":");
        words[words.length-4] = jstoi_q(words[words.length-4]) + jstoi_q(words[words.length-3])*256;
        words[words.length-3] = jstoi_q(words[words.length-2]) + jstoi_q(words[words.length-1])*256;
        words = words.slice(0, words.length-2);
      } else {
        words = str.split(":");
      }
  
      offset = 0; z = 0;
      for (w=0; w < words.length; w++) {
        if (typeof words[w] == 'string') {
          if (words[w] === 'Z') {
            // compressed zeros - write appropriate number of zero words
            for (z = 0; z < (8 - words.length+1); z++) {
              parts[w+z] = 0;
            }
            offset = z-1;
          } else {
            // parse hex to field to 16-bit value and write it in network byte-order
            parts[w+offset] = _htons(parseInt(words[w],16));
          }
        } else {
          // parsed IPv4 words
          parts[w+offset] = words[w];
        }
      }
      return [
        (parts[1] << 16) | parts[0],
        (parts[3] << 16) | parts[2],
        (parts[5] << 16) | parts[4],
        (parts[7] << 16) | parts[6]
      ];
    };
  
  
  /** @param {number=} addrlen */
  var writeSockaddr = (sa, family, addr, port, addrlen) => {
      switch (family) {
        case 2:
          addr = inetPton4(addr);
          zeroMemory(sa, 16);
          if (addrlen) {
            HEAP32[((addrlen)>>2)] = 16;
          }
          HEAP16[((sa)>>1)] = family;
          HEAP32[(((sa)+(4))>>2)] = addr;
          HEAP16[(((sa)+(2))>>1)] = _htons(port);
          break;
        case 10:
          addr = inetPton6(addr);
          zeroMemory(sa, 28);
          if (addrlen) {
            HEAP32[((addrlen)>>2)] = 28;
          }
          HEAP32[((sa)>>2)] = family;
          HEAP32[(((sa)+(8))>>2)] = addr[0];
          HEAP32[(((sa)+(12))>>2)] = addr[1];
          HEAP32[(((sa)+(16))>>2)] = addr[2];
          HEAP32[(((sa)+(20))>>2)] = addr[3];
          HEAP16[(((sa)+(2))>>1)] = _htons(port);
          break;
        default:
          return 5;
      }
      return 0;
    };
  
  
  var DNS = {
  address_map:{
  id:1,
  addrs:{
  },
  names:{
  },
  },
  lookup_name(name) {
        // If the name is already a valid ipv4 / ipv6 address, don't generate a fake one.
        var res = inetPton4(name);
        if (res !== null) {
          return name;
        }
        res = inetPton6(name);
        if (res !== null) {
          return name;
        }
  
        // See if this name is already mapped.
        var addr;
  
        if (DNS.address_map.addrs[name]) {
          addr = DNS.address_map.addrs[name];
        } else {
          var id = DNS.address_map.id++;
          assert(id < 65535, 'exceeded max address mappings of 65535');
  
          addr = '172.29.' + (id & 0xff) + '.' + (id & 0xff00);
  
          DNS.address_map.names[addr] = name;
          DNS.address_map.addrs[name] = addr;
        }
  
        return addr;
      },
  lookup_addr(addr) {
        if (DNS.address_map.names[addr]) {
          return DNS.address_map.names[addr];
        }
  
        return null;
      },
  };
  
  
  
  function ___syscall_accept4(fd, addr, addrlen, flags, d1, d2) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(3, 1, fd, addr, addrlen, flags, d1, d2);
  
  try {
  
      var sock = getSocketFromFD(fd);
      var newsock = sock.sock_ops.accept(sock);
      if (addr) {
        var errno = writeSockaddr(addr, newsock.family, DNS.lookup_name(newsock.daddr), newsock.dport, addrlen);
      }
      return newsock.stream.fd;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  var inetNtop4 = (addr) => {
      return (addr & 0xff) + '.' + ((addr >> 8) & 0xff) + '.' + ((addr >> 16) & 0xff) + '.' + ((addr >> 24) & 0xff)
    };
  
  
  var inetNtop6 = (ints) => {
      //  ref:  http://www.ietf.org/rfc/rfc2373.txt - section 2.5.4
      //  Format for IPv4 compatible and mapped  128-bit IPv6 Addresses
      //  128-bits are split into eight 16-bit words
      //  stored in network byte order (big-endian)
      //  |                80 bits               | 16 |      32 bits        |
      //  +-----------------------------------------------------------------+
      //  |               10 bytes               |  2 |      4 bytes        |
      //  +--------------------------------------+--------------------------+
      //  +               5 words                |  1 |      2 words        |
      //  +--------------------------------------+--------------------------+
      //  |0000..............................0000|0000|    IPv4 ADDRESS     | (compatible)
      //  +--------------------------------------+----+---------------------+
      //  |0000..............................0000|FFFF|    IPv4 ADDRESS     | (mapped)
      //  +--------------------------------------+----+---------------------+
      var str = "";
      var word = 0;
      var longest = 0;
      var lastzero = 0;
      var zstart = 0;
      var len = 0;
      var i = 0;
      var parts = [
        ints[0] & 0xffff,
        (ints[0] >> 16),
        ints[1] & 0xffff,
        (ints[1] >> 16),
        ints[2] & 0xffff,
        (ints[2] >> 16),
        ints[3] & 0xffff,
        (ints[3] >> 16)
      ];
  
      // Handle IPv4-compatible, IPv4-mapped, loopback and any/unspecified addresses
  
      var hasipv4 = true;
      var v4part = "";
      // check if the 10 high-order bytes are all zeros (first 5 words)
      for (i = 0; i < 5; i++) {
        if (parts[i] !== 0) { hasipv4 = false; break; }
      }
  
      if (hasipv4) {
        // low-order 32-bits store an IPv4 address (bytes 13 to 16) (last 2 words)
        v4part = inetNtop4(parts[6] | (parts[7] << 16));
        // IPv4-mapped IPv6 address if 16-bit value (bytes 11 and 12) == 0xFFFF (6th word)
        if (parts[5] === -1) {
          str = "::ffff:";
          str += v4part;
          return str;
        }
        // IPv4-compatible IPv6 address if 16-bit value (bytes 11 and 12) == 0x0000 (6th word)
        if (parts[5] === 0) {
          str = "::";
          //special case IPv6 addresses
          if (v4part === "0.0.0.0") v4part = ""; // any/unspecified address
          if (v4part === "0.0.0.1") v4part = "1";// loopback address
          str += v4part;
          return str;
        }
      }
  
      // Handle all other IPv6 addresses
  
      // first run to find the longest contiguous zero words
      for (word = 0; word < 8; word++) {
        if (parts[word] === 0) {
          if (word - lastzero > 1) {
            len = 0;
          }
          lastzero = word;
          len++;
        }
        if (len > longest) {
          longest = len;
          zstart = word - longest + 1;
        }
      }
  
      for (word = 0; word < 8; word++) {
        if (longest > 1) {
          // compress contiguous zeros - to produce "::"
          if (parts[word] === 0 && word >= zstart && word < (zstart + longest) ) {
            if (word === zstart) {
              str += ":";
              if (zstart === 0) str += ":"; //leading zeros case
            }
            continue;
          }
        }
        // converts 16-bit words from big-endian to little-endian before converting to hex string
        str += Number(_ntohs(parts[word] & 0xffff)).toString(16);
        str += word < 7 ? ":" : "";
      }
      return str;
    };
  
  var readSockaddr = (sa, salen) => {
      // family / port offsets are common to both sockaddr_in and sockaddr_in6
      var family = HEAP16[((sa)>>1)];
      var port = _ntohs(HEAPU16[(((sa)+(2))>>1)]);
      var addr;
  
      switch (family) {
        case 2:
          if (salen !== 16) {
            return { errno: 28 };
          }
          addr = HEAP32[(((sa)+(4))>>2)];
          addr = inetNtop4(addr);
          break;
        case 10:
          if (salen !== 28) {
            return { errno: 28 };
          }
          addr = [
            HEAP32[(((sa)+(8))>>2)],
            HEAP32[(((sa)+(12))>>2)],
            HEAP32[(((sa)+(16))>>2)],
            HEAP32[(((sa)+(20))>>2)]
          ];
          addr = inetNtop6(addr);
          break;
        default:
          return { errno: 5 };
      }
  
      return { family: family, addr: addr, port: port };
    };
  
  
  /** @param {boolean=} allowNull */
  var getSocketAddress = (addrp, addrlen, allowNull) => {
      if (allowNull && addrp === 0) return null;
      var info = readSockaddr(addrp, addrlen);
      if (info.errno) throw new FS.ErrnoError(info.errno);
      info.addr = DNS.lookup_addr(info.addr) || info.addr;
      return info;
    };
  
  
  
  function ___syscall_bind(fd, addr, addrlen, d1, d2, d3) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(4, 1, fd, addr, addrlen, d1, d2, d3);
  
  try {
  
      var sock = getSocketFromFD(fd);
      var info = getSocketAddress(addr, addrlen);
      sock.sock_ops.bind(sock, info.addr, info.port);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function ___syscall_chdir(path) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(5, 1, path);
  
  try {
  
      path = SYSCALLS.getStr(path);
      FS.chdir(path);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  
  function ___syscall_connect(fd, addr, addrlen, d1, d2, d3) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(6, 1, fd, addr, addrlen, d1, d2, d3);
  
  try {
  
      var sock = getSocketFromFD(fd);
      var info = getSocketAddress(addr, addrlen);
      sock.sock_ops.connect(sock, info.addr, info.port);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function ___syscall_dup3(fd, newfd, flags) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(7, 1, fd, newfd, flags);
  
  try {
  
      var old = SYSCALLS.getStreamFromFD(fd);
      if (old.fd === newfd) return -28;
      var existing = FS.getStream(newfd);
      if (existing) FS.close(existing);
      return FS.createStream(old, newfd).fd;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function ___syscall_faccessat(dirfd, path, amode, flags) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(8, 1, dirfd, path, amode, flags);
  
  try {
  
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      if (amode & ~7) {
        // need a valid mode
        return -28;
      }
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      if (!node) {
        return -44;
      }
      var perms = '';
      if (amode & 4) perms += 'r';
      if (amode & 2) perms += 'w';
      if (amode & 1) perms += 'x';
      if (perms /* otherwise, they've just passed F_OK */ && FS.nodePermissions(node, perms)) {
        return -2;
      }
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  function ___syscall_fallocate(fd, mode, offset, len) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(9, 1, fd, mode, offset, len);
  
    offset = bigintToI53Checked(offset);;
    len = bigintToI53Checked(len);;
  
    
  try {
  
      if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd)
      FS.allocate(stream, offset, len);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  ;
  
  }
  

  
  
  
  function ___syscall_fcntl64(fd, cmd, varargs) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(10, 1, fd, cmd, varargs);
  
  SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (cmd) {
        case 0: {
          var arg = SYSCALLS.get();
          if (arg < 0) {
            return -28;
          }
          while (FS.streams[arg]) {
            arg++;
          }
          var newStream;
          newStream = FS.createStream(stream, arg);
          return newStream.fd;
        }
        case 1:
        case 2:
          return 0;  // FD_CLOEXEC makes no sense for a single process.
        case 3:
          return stream.flags;
        case 4: {
          var arg = SYSCALLS.get();
          stream.flags |= arg;
          return 0;
        }
        case 5: {
          var arg = SYSCALLS.getp();
          var offset = 0;
          // We're always unlocked.
          HEAP16[(((arg)+(offset))>>1)] = 2;
          return 0;
        }
        case 6:
        case 7:
          return 0; // Pretend that the locking is successful.
        case 16:
        case 8:
          return -28; // These are for sockets. We don't have them fully implemented yet.
        case 9:
          // musl trusts getown return values, due to a bug where they must be, as they overlap with errors. just return -1 here, so fcntl() returns that, and we set errno ourselves.
          setErrNo(28);
          return -1;
        default: {
          return -28;
        }
      }
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function ___syscall_fstat64(fd, buf) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(11, 1, fd, buf);
  
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      return SYSCALLS.doStat(FS.stat, stream.path, buf);
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  function ___syscall_ftruncate64(fd, length) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(12, 1, fd, length);
  
    length = bigintToI53Checked(length);;
  
    
  try {
  
      if (isNaN(length)) return 61;
      FS.ftruncate(fd, length);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  ;
  
  }
  

  
  var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    };
  
  
  
  function ___syscall_getcwd(buf, size) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(13, 1, buf, size);
  
  try {
  
      if (size === 0) return -28;
      var cwd = FS.cwd();
      var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
      if (size < cwdLengthInBytes) return -68;
      stringToUTF8(cwd, buf, size);
      return cwdLengthInBytes;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  function ___syscall_getdents64(fd, dirp, count) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(14, 1, fd, dirp, count);
  
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd)
      if (!stream.getdents) {
        stream.getdents = FS.readdir(stream.path);
      }
  
      var struct_size = 280;
      var pos = 0;
      var off = FS.llseek(stream, 0, 1);
  
      var idx = Math.floor(off / struct_size);
  
      while (idx < stream.getdents.length && pos + struct_size <= count) {
        var id;
        var type;
        var name = stream.getdents[idx];
        if (name === '.') {
          id = stream.node.id;
          type = 4; // DT_DIR
        }
        else if (name === '..') {
          var lookup = FS.lookupPath(stream.path, { parent: true });
          id = lookup.node.id;
          type = 4; // DT_DIR
        }
        else {
          var child = FS.lookupNode(stream.node, name);
          id = child.id;
          type = FS.isChrdev(child.mode) ? 2 :  // DT_CHR, character device.
                 FS.isDir(child.mode) ? 4 :     // DT_DIR, directory.
                 FS.isLink(child.mode) ? 10 :   // DT_LNK, symbolic link.
                 8;                             // DT_REG, regular file.
        }
        HEAP64[((dirp + pos)>>3)] = BigInt(id);
        HEAP64[(((dirp + pos)+(8))>>3)] = BigInt((idx + 1) * struct_size);
        HEAP16[(((dirp + pos)+(16))>>1)] = 280;
        HEAP8[(((dirp + pos)+(18))>>0)] = type;
        stringToUTF8(name, dirp + pos + 19, 256);
        pos += struct_size;
        idx += 1;
      }
      FS.llseek(stream, idx * struct_size, 0);
      return pos;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  
  
  function ___syscall_getpeername(fd, addr, addrlen, d1, d2, d3) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(15, 1, fd, addr, addrlen, d1, d2, d3);
  
  try {
  
      var sock = getSocketFromFD(fd);
      if (!sock.daddr) {
        return -53; // The socket is not connected.
      }
      var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(sock.daddr), sock.dport, addrlen);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  
  
  function ___syscall_getsockname(fd, addr, addrlen, d1, d2, d3) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(16, 1, fd, addr, addrlen, d1, d2, d3);
  
  try {
  
      var sock = getSocketFromFD(fd);
      // TODO: sock.saddr should never be undefined, see TODO in websocket_sock_ops.getname
      var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(sock.saddr || '0.0.0.0'), sock.sport, addrlen);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  function ___syscall_getsockopt(fd, level, optname, optval, optlen, d1) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(17, 1, fd, level, optname, optval, optlen, d1);
  
  try {
  
      var sock = getSocketFromFD(fd);
      // Minimal getsockopt aimed at resolving https://github.com/emscripten-core/emscripten/issues/2211
      // so only supports SOL_SOCKET with SO_ERROR.
      if (level === 1) {
        if (optname === 4) {
          HEAP32[((optval)>>2)] = sock.error;
          HEAP32[((optlen)>>2)] = 4;
          sock.error = null; // Clear the error (The SO_ERROR option obtains and then clears this field).
          return 0;
        }
      }
      return -50; // The option is unknown at the level indicated.
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function ___syscall_ioctl(fd, op, varargs) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(18, 1, fd, op, varargs);
  
  SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (op) {
        case 21509: {
          if (!stream.tty) return -59;
          return 0;
        }
        case 21505: {
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tcgets) {
            var termios = stream.tty.ops.ioctl_tcgets(stream);
            var argp = SYSCALLS.getp();
            HEAP32[((argp)>>2)] = termios.c_iflag || 0;
            HEAP32[(((argp)+(4))>>2)] = termios.c_oflag || 0;
            HEAP32[(((argp)+(8))>>2)] = termios.c_cflag || 0;
            HEAP32[(((argp)+(12))>>2)] = termios.c_lflag || 0;
            for (var i = 0; i < 32; i++) {
              HEAP8[(((argp + i)+(17))>>0)] = termios.c_cc[i] || 0;
            }
            return 0;
          }
          return 0;
        }
        case 21510:
        case 21511:
        case 21512: {
          if (!stream.tty) return -59;
          return 0; // no-op, not actually adjusting terminal settings
        }
        case 21506:
        case 21507:
        case 21508: {
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tcsets) {
            var argp = SYSCALLS.getp();
            var c_iflag = HEAP32[((argp)>>2)];
            var c_oflag = HEAP32[(((argp)+(4))>>2)];
            var c_cflag = HEAP32[(((argp)+(8))>>2)];
            var c_lflag = HEAP32[(((argp)+(12))>>2)];
            var c_cc = []
            for (var i = 0; i < 32; i++) {
              c_cc.push(HEAP8[(((argp + i)+(17))>>0)]);
            }
            return stream.tty.ops.ioctl_tcsets(stream.tty, op, { c_iflag, c_oflag, c_cflag, c_lflag, c_cc });
          }
          return 0; // no-op, not actually adjusting terminal settings
        }
        case 21519: {
          if (!stream.tty) return -59;
          var argp = SYSCALLS.getp();
          HEAP32[((argp)>>2)] = 0;
          return 0;
        }
        case 21520: {
          if (!stream.tty) return -59;
          return -28; // not supported
        }
        case 21531: {
          var argp = SYSCALLS.getp();
          return FS.ioctl(stream, op, argp);
        }
        case 21523: {
          // TODO: in theory we should write to the winsize struct that gets
          // passed in, but for now musl doesn't read anything on it
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tiocgwinsz) {
            var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
            var argp = SYSCALLS.getp();
            HEAP16[((argp)>>1)] = winsize[0];
            HEAP16[(((argp)+(2))>>1)] = winsize[1];
          }
          return 0;
        }
        case 21524: {
          // TODO: technically, this ioctl call should change the window size.
          // but, since emscripten doesn't have any concept of a terminal window
          // yet, we'll just silently throw it away as we do TIOCGWINSZ
          if (!stream.tty) return -59;
          return 0;
        }
        case 21515: {
          if (!stream.tty) return -59;
          return 0;
        }
        default: return -28; // not supported
      }
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  function ___syscall_listen(fd, backlog) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(19, 1, fd, backlog);
  
  try {
  
      var sock = getSocketFromFD(fd);
      sock.sock_ops.listen(sock, backlog);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function ___syscall_lstat64(path, buf) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(20, 1, path, buf);
  
  try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doStat(FS.lstat, path, buf);
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function ___syscall_mkdirat(dirfd, path, mode) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(21, 1, dirfd, path, mode);
  
  try {
  
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      // remove a trailing slash, if one - /a/b/ has basename of '', but
      // we want to create b in the context of this function
      path = PATH.normalize(path);
      if (path[path.length-1] === '/') path = path.substr(0, path.length-1);
      FS.mkdir(path, mode, 0);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function ___syscall_newfstatat(dirfd, path, buf, flags) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(22, 1, dirfd, path, buf, flags);
  
  try {
  
      path = SYSCALLS.getStr(path);
      var nofollow = flags & 256;
      var allowEmpty = flags & 4096;
      flags = flags & (~6400);
      path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
      return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function ___syscall_openat(dirfd, path, flags, varargs) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(23, 1, dirfd, path, flags, varargs);
  
  SYSCALLS.varargs = varargs;
  try {
  
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      var mode = varargs ? SYSCALLS.get() : 0;
      return FS.open(path, flags, mode).fd;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  var PIPEFS = {
  BUCKET_BUFFER_SIZE:8192,
  mount(mount) {
        // Do not pollute the real root directory or its child nodes with pipes
        // Looks like it is OK to create another pseudo-root node not linked to the FS.root hierarchy this way
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },
  createPipe() {
        var pipe = {
          buckets: [],
          // refcnt 2 because pipe has a read end and a write end. We need to be
          // able to read from the read end after write end is closed.
          refcnt : 2,
        };
  
        pipe.buckets.push({
          buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
          offset: 0,
          roffset: 0
        });
  
        var rName = PIPEFS.nextname();
        var wName = PIPEFS.nextname();
        var rNode = FS.createNode(PIPEFS.root, rName, 4096, 0);
        var wNode = FS.createNode(PIPEFS.root, wName, 4096, 0);
  
        rNode.pipe = pipe;
        wNode.pipe = pipe;
  
        var readableStream = FS.createStream({
          path: rName,
          node: rNode,
          flags: 0,
          seekable: false,
          stream_ops: PIPEFS.stream_ops
        });
        rNode.stream = readableStream;
  
        var writableStream = FS.createStream({
          path: wName,
          node: wNode,
          flags: 1,
          seekable: false,
          stream_ops: PIPEFS.stream_ops
        });
        wNode.stream = writableStream;
  
        return {
          readable_fd: readableStream.fd,
          writable_fd: writableStream.fd
        };
      },
  stream_ops:{
  poll(stream) {
          var pipe = stream.node.pipe;
  
          if ((stream.flags & 2097155) === 1) {
            return (256 | 4);
          }
          if (pipe.buckets.length > 0) {
            for (var i = 0; i < pipe.buckets.length; i++) {
              var bucket = pipe.buckets[i];
              if (bucket.offset - bucket.roffset > 0) {
                return (64 | 1);
              }
            }
          }
  
          return 0;
        },
  ioctl(stream, request, varargs) {
          return 28;
        },
  fsync(stream) {
          return 28;
        },
  read(stream, buffer, offset, length, position /* ignored */) {
          var pipe = stream.node.pipe;
          var currentLength = 0;
  
          for (var i = 0; i < pipe.buckets.length; i++) {
            var bucket = pipe.buckets[i];
            currentLength += bucket.offset - bucket.roffset;
          }
  
          var data = buffer.subarray(offset, offset + length);
  
          if (length <= 0) {
            return 0;
          }
          if (currentLength == 0) {
            // Behave as if the read end is always non-blocking
            throw new FS.ErrnoError(6);
          }
          var toRead = Math.min(currentLength, length);
  
          var totalRead = toRead;
          var toRemove = 0;
  
          for (var i = 0; i < pipe.buckets.length; i++) {
            var currBucket = pipe.buckets[i];
            var bucketSize = currBucket.offset - currBucket.roffset;
  
            if (toRead <= bucketSize) {
              var tmpSlice = currBucket.buffer.subarray(currBucket.roffset, currBucket.offset);
              if (toRead < bucketSize) {
                tmpSlice = tmpSlice.subarray(0, toRead);
                currBucket.roffset += toRead;
              } else {
                toRemove++;
              }
              data.set(tmpSlice);
              break;
            } else {
              var tmpSlice = currBucket.buffer.subarray(currBucket.roffset, currBucket.offset);
              data.set(tmpSlice);
              data = data.subarray(tmpSlice.byteLength);
              toRead -= tmpSlice.byteLength;
              toRemove++;
            }
          }
  
          if (toRemove && toRemove == pipe.buckets.length) {
            // Do not generate excessive garbage in use cases such as
            // write several bytes, read everything, write several bytes, read everything...
            toRemove--;
            pipe.buckets[toRemove].offset = 0;
            pipe.buckets[toRemove].roffset = 0;
          }
  
          pipe.buckets.splice(0, toRemove);
  
          return totalRead;
        },
  write(stream, buffer, offset, length, position /* ignored */) {
          var pipe = stream.node.pipe;
  
          var data = buffer.subarray(offset, offset + length);
  
          var dataLen = data.byteLength;
          if (dataLen <= 0) {
            return 0;
          }
  
          var currBucket = null;
  
          if (pipe.buckets.length == 0) {
            currBucket = {
              buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
              offset: 0,
              roffset: 0
            };
            pipe.buckets.push(currBucket);
          } else {
            currBucket = pipe.buckets[pipe.buckets.length - 1];
          }
  
          assert(currBucket.offset <= PIPEFS.BUCKET_BUFFER_SIZE);
  
          var freeBytesInCurrBuffer = PIPEFS.BUCKET_BUFFER_SIZE - currBucket.offset;
          if (freeBytesInCurrBuffer >= dataLen) {
            currBucket.buffer.set(data, currBucket.offset);
            currBucket.offset += dataLen;
            return dataLen;
          } else if (freeBytesInCurrBuffer > 0) {
            currBucket.buffer.set(data.subarray(0, freeBytesInCurrBuffer), currBucket.offset);
            currBucket.offset += freeBytesInCurrBuffer;
            data = data.subarray(freeBytesInCurrBuffer, data.byteLength);
          }
  
          var numBuckets = (data.byteLength / PIPEFS.BUCKET_BUFFER_SIZE) | 0;
          var remElements = data.byteLength % PIPEFS.BUCKET_BUFFER_SIZE;
  
          for (var i = 0; i < numBuckets; i++) {
            var newBucket = {
              buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
              offset: PIPEFS.BUCKET_BUFFER_SIZE,
              roffset: 0
            };
            pipe.buckets.push(newBucket);
            newBucket.buffer.set(data.subarray(0, PIPEFS.BUCKET_BUFFER_SIZE));
            data = data.subarray(PIPEFS.BUCKET_BUFFER_SIZE, data.byteLength);
          }
  
          if (remElements > 0) {
            var newBucket = {
              buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
              offset: data.byteLength,
              roffset: 0
            };
            pipe.buckets.push(newBucket);
            newBucket.buffer.set(data);
          }
  
          return dataLen;
        },
  close(stream) {
          var pipe = stream.node.pipe;
          pipe.refcnt--;
          if (pipe.refcnt === 0) {
            pipe.buckets = null;
          }
        },
  },
  nextname() {
        if (!PIPEFS.nextname.current) {
          PIPEFS.nextname.current = 0;
        }
        return 'pipe[' + (PIPEFS.nextname.current++) + ']';
      },
  };
  
  
  
  function ___syscall_pipe(fdPtr) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(24, 1, fdPtr);
  
  try {
  
      if (fdPtr == 0) {
        throw new FS.ErrnoError(21);
      }
  
      var res = PIPEFS.createPipe();
  
      HEAP32[((fdPtr)>>2)] = res.readable_fd;
      HEAP32[(((fdPtr)+(4))>>2)] = res.writable_fd;
  
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function xterm_pty_old_poll(fds, nfds, timeout) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(25, 1, fds, nfds, timeout);
  
  try {
  
      var nonzero = 0;
      for (var i = 0; i < nfds; i++) {
        var pollfd = fds + 8 * i;
        var fd = HEAP32[((pollfd)>>2)];
        var events = HEAP16[(((pollfd)+(4))>>1)];
        var mask = 32;
        var stream = FS.getStream(fd);
        if (stream) {
          mask = SYSCALLS.DEFAULT_POLLMASK;
          if (stream.stream_ops.poll) {
            mask = stream.stream_ops.poll(stream, -1);
          }
        }
        mask &= events | 8 | 16;
        if (mask) nonzero++;
        HEAP16[(((pollfd)+(6))>>1)] = mask;
      }
      return nonzero;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  
  
  
  var PTY_waitForReadableWithCallback = (callback) => {
          if (PTY_pollTimeout === 0) {
              return callback(PTY.readable ? 0 /* ready */ : 2 /* timeout */);
          }
          let handlerReadable, handlerSignal, timeoutId;
          new Promise((resolve) => {
              handlerReadable = PTY.onReadable(() => resolve(0 /* ready */));
  
              // We need to stop select(2) when a signal is caught.
              //
              // TODO: In fact, it should be stopped "when a signal handler is called," not "a the signal is received."
              // If the signal handler is set as SIG_IGN, select(2) should not be stopped.
              handlerSignal = PTY.onSignal(() => resolve(1 /* interrupted */));
  
              if (PTY_pollTimeout >= 0) {
                  // if negative timeout, don't stop early (in poll-like functions it means infinite wait),
                  // otherwise wait specified number of ms.
                  timeoutId = setTimeout(resolve, PTY_pollTimeout, 2 /* timeout */);
              }
          })
          .then(type => {
              handlerReadable.dispose();
              handlerSignal.dispose();
              // note: it's fine to call even with undefined timeoutId
              clearTimeout(timeoutId);
              callback(type);
          });
      };
  
  var PTY_waitForReadableWithAtomicImpl = 
  function(atomicIndex) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(26, 0, atomicIndex);
  
          PTY_waitForReadableWithCallback(type => {
              Atomics.store(HEAP32, atomicIndex, type);
              Atomics.notify(HEAP32, atomicIndex);
          });
      
  }
  ;
  
  var PTY_atomicIndex = 0;
  
  var PTY_waitForReadableWithAtomic = (callback) => {
          if (!PTY_atomicIndex) {
              PTY_atomicIndex = _malloc(4) >> 2;
          }
          HEAP32[PTY_atomicIndex] = -1;
          PTY_waitForReadableWithAtomicImpl(PTY_atomicIndex);
          Atomics.wait(HEAP32, PTY_atomicIndex, -1);
          callback(HEAP32[PTY_atomicIndex]);
      };
  var PTY_waitForReadable = PTY_waitForReadableWithAtomic;
  
  var PTY_handleSleepWithAtomic = (startAsync) => {
          let result;
          startAsync(r => result = r);
          return result;
      };
  var PTY_handleSleep = PTY_handleSleepWithAtomic;
  var PTY_wrapPoll = (impl) => PTY_handleSleep((wakeUp) => {
          let result = impl();
          // Did this call return our variant of EAGAIN?
          // If so, that means it called into the PTY and the buffer was empty.
          if (result === -1006) {
              // Wait for the PTY to become readable and try again.
              PTY_waitForReadable(type => {
                  switch (type) {
                      case 0: /* ready */
                          wakeUp(impl());
                          break;
                      case 1: /* interrupted */
                          wakeUp(-27);
                          break;
                      case 2: /* timeout */
                          wakeUp(0);
                          break;
                  }
              });
          } else {
              wakeUp(result);
          }
      });
  var ___syscall_poll = (fds, nfds, timeout) => PTY_wrapPoll(() => xterm_pty_old_poll(fds, nfds, timeout));

  
  
  
  
  function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(27, 1, dirfd, path, buf, bufsize);
  
  try {
  
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      if (bufsize <= 0) return -28;
      var ret = FS.readlink(path);
  
      var len = Math.min(bufsize, lengthBytesUTF8(ret));
      var endChar = HEAP8[buf+len];
      stringToUTF8(ret, buf, bufsize+1);
      // readlink is one of the rare functions that write out a C string, but does never append a null to the output buffer(!)
      // stringToUTF8() always appends a null byte, so restore the character under the null byte after the write.
      HEAP8[buf+len] = endChar;
      return len;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  
  
  function ___syscall_recvfrom(fd, buf, len, flags, addr, addrlen) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(28, 1, fd, buf, len, flags, addr, addrlen);
  
  try {
  
      var sock = getSocketFromFD(fd);
      var msg = sock.sock_ops.recvmsg(sock, len);
      if (!msg) return 0; // socket is closed
      if (addr) {
        var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(msg.addr), msg.port, addrlen);
      }
      HEAPU8.set(msg.buffer, buf);
      return msg.buffer.byteLength;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  
  
  function ___syscall_recvmsg(fd, message, flags, d1, d2, d3) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(29, 1, fd, message, flags, d1, d2, d3);
  
  try {
  
      var sock = getSocketFromFD(fd);
      var iov = HEAPU32[(((message)+(8))>>2)];
      var num = HEAP32[(((message)+(12))>>2)];
      // get the total amount of data we can read across all arrays
      var total = 0;
      for (var i = 0; i < num; i++) {
        total += HEAP32[(((iov)+((8 * i) + 4))>>2)];
      }
      // try to read total data
      var msg = sock.sock_ops.recvmsg(sock, total);
      if (!msg) return 0; // socket is closed
  
      // TODO honor flags:
      // MSG_OOB
      // Requests out-of-band data. The significance and semantics of out-of-band data are protocol-specific.
      // MSG_PEEK
      // Peeks at the incoming message.
      // MSG_WAITALL
      // Requests that the function block until the full amount of data requested can be returned. The function may return a smaller amount of data if a signal is caught, if the connection is terminated, if MSG_PEEK was specified, or if an error is pending for the socket.
  
      // write the source address out
      var name = HEAPU32[((message)>>2)];
      if (name) {
        var errno = writeSockaddr(name, sock.family, DNS.lookup_name(msg.addr), msg.port);
      }
      // write the buffer out to the scatter-gather arrays
      var bytesRead = 0;
      var bytesRemaining = msg.buffer.byteLength;
      for (var i = 0; bytesRemaining > 0 && i < num; i++) {
        var iovbase = HEAPU32[(((iov)+((8 * i) + 0))>>2)];
        var iovlen = HEAP32[(((iov)+((8 * i) + 4))>>2)];
        if (!iovlen) {
          continue;
        }
        var length = Math.min(iovlen, bytesRemaining);
        var buf = msg.buffer.subarray(bytesRead, bytesRead + length);
        HEAPU8.set(buf, iovbase + bytesRead);
        bytesRead += length;
        bytesRemaining -= length;
      }
  
      // TODO set msghdr.msg_flags
      // MSG_EOR
      // End of record was received (if supported by the protocol).
      // MSG_OOB
      // Out-of-band data was received.
      // MSG_TRUNC
      // Normal data was truncated.
      // MSG_CTRUNC
  
      return bytesRead;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(30, 1, olddirfd, oldpath, newdirfd, newpath);
  
  try {
  
      oldpath = SYSCALLS.getStr(oldpath);
      newpath = SYSCALLS.getStr(newpath);
      oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
      newpath = SYSCALLS.calculateAt(newdirfd, newpath);
      FS.rename(oldpath, newpath);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function ___syscall_rmdir(path) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(31, 1, path);
  
  try {
  
      path = SYSCALLS.getStr(path);
      FS.rmdir(path);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  
  
  function ___syscall_sendmsg(fd, message, flags, d1, d2, d3) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(32, 1, fd, message, flags, d1, d2, d3);
  
  try {
  
      var sock = getSocketFromFD(fd);
      var iov = HEAPU32[(((message)+(8))>>2)];
      var num = HEAP32[(((message)+(12))>>2)];
      // read the address and port to send to
      var addr, port;
      var name = HEAPU32[((message)>>2)];
      var namelen = HEAP32[(((message)+(4))>>2)];
      if (name) {
        var info = readSockaddr(name, namelen);
        if (info.errno) return -info.errno;
        port = info.port;
        addr = DNS.lookup_addr(info.addr) || info.addr;
      }
      // concatenate scatter-gather arrays into one message buffer
      var total = 0;
      for (var i = 0; i < num; i++) {
        total += HEAP32[(((iov)+((8 * i) + 4))>>2)];
      }
      var view = new Uint8Array(total);
      var offset = 0;
      for (var i = 0; i < num; i++) {
        var iovbase = HEAPU32[(((iov)+((8 * i) + 0))>>2)];
        var iovlen = HEAP32[(((iov)+((8 * i) + 4))>>2)];
        for (var j = 0; j < iovlen; j++) {
          view[offset++] = HEAP8[(((iovbase)+(j))>>0)];
        }
      }
      // write the buffer
      return sock.sock_ops.sendmsg(sock, view, 0, total, addr, port);
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  
  function ___syscall_sendto(fd, message, length, flags, addr, addr_len) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(33, 1, fd, message, length, flags, addr, addr_len);
  
  try {
  
      var sock = getSocketFromFD(fd);
      var dest = getSocketAddress(addr, addr_len, true);
      if (!dest) {
        // send, no address provided
        return FS.write(sock.stream, HEAP8, message, length);
      }
      // sendto an address
      return sock.sock_ops.sendmsg(sock, HEAP8, message, length, dest.addr, dest.port);
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  function ___syscall_socket(domain, type, protocol) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(34, 1, domain, type, protocol);
  
  try {
  
      var sock = SOCKFS.createSocket(domain, type, protocol);
      return sock.stream.fd;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function ___syscall_stat64(path, buf) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(35, 1, path, buf);
  
  try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doStat(FS.stat, path, buf);
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function ___syscall_statfs64(path, size, buf) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(36, 1, path, size, buf);
  
  try {
  
      path = SYSCALLS.getStr(path);
      // NOTE: None of the constants here are true. We're just returning safe and
      //       sane values.
      HEAP32[(((buf)+(4))>>2)] = 4096;
      HEAP32[(((buf)+(40))>>2)] = 4096;
      HEAP32[(((buf)+(8))>>2)] = 1000000;
      HEAP32[(((buf)+(12))>>2)] = 500000;
      HEAP32[(((buf)+(16))>>2)] = 500000;
      HEAP32[(((buf)+(20))>>2)] = FS.nextInode;
      HEAP32[(((buf)+(24))>>2)] = 1000000;
      HEAP32[(((buf)+(28))>>2)] = 42;
      HEAP32[(((buf)+(44))>>2)] = 2;  // ST_NOSUID
      HEAP32[(((buf)+(36))>>2)] = 255;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  function ___syscall_unlinkat(dirfd, path, flags) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(37, 1, dirfd, path, flags);
  
  try {
  
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      if (flags === 0) {
        FS.unlink(path);
      } else if (flags === 512) {
        FS.rmdir(path);
      } else {
        abort('Invalid flags passed to unlinkat');
      }
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  var nowIsMonotonic = 1;
  var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;

  
  
  
  
  var maybeExit = () => {
      if (!keepRuntimeAlive()) {
        try {
          if (ENVIRONMENT_IS_PTHREAD) __emscripten_thread_exit(EXITSTATUS);
          else
          _exit(EXITSTATUS);
        } catch (e) {
          handleException(e);
        }
      }
    };
  var callUserCallback = (func) => {
      if (ABORT) {
        return;
      }
      try {
        func();
        maybeExit();
      } catch (e) {
        handleException(e);
      }
    };
  
  
  
  var __emscripten_thread_mailbox_await = (pthread_ptr) => {
      if (typeof Atomics.waitAsync === 'function') {
        // Wait on the pthread's initial self-pointer field because it is easy and
        // safe to access from sending threads that need to notify the waiting
        // thread.
        // TODO: How to make this work with wasm64?
        var wait = Atomics.waitAsync(HEAP32, ((pthread_ptr)>>2), pthread_ptr);
        wait.value.then(checkMailbox);
        var waitingAsync = pthread_ptr + 128;
        Atomics.store(HEAP32, ((waitingAsync)>>2), 1);
      }
      // If `Atomics.waitAsync` is not implemented, then we will always fall back
      // to postMessage and there is no need to do anything here.
    };
  Module['__emscripten_thread_mailbox_await'] = __emscripten_thread_mailbox_await;
  
  var checkMailbox = () => {
      // Only check the mailbox if we have a live pthread runtime. We implement
      // pthread_self to return 0 if there is no live runtime.
      var pthread_ptr = _pthread_self();
      if (pthread_ptr) {
        // If we are using Atomics.waitAsync as our notification mechanism, wait
        // for a notification before processing the mailbox to avoid missing any
        // work that could otherwise arrive after we've finished processing the
        // mailbox and before we're ready for the next notification.
        __emscripten_thread_mailbox_await(pthread_ptr);
        callUserCallback(__emscripten_check_mailbox);
      }
    };
  Module['checkMailbox'] = checkMailbox;
  
  var __emscripten_notify_mailbox_postmessage = (targetThreadId, currThreadId, mainThreadId) => {
      if (targetThreadId == currThreadId) {
        setTimeout(() => checkMailbox());
      } else if (ENVIRONMENT_IS_PTHREAD) {
        postMessage({'targetThread' : targetThreadId, 'cmd' : 'checkMailbox'});
      } else {
        var worker = PThread.pthreads[targetThreadId];
        if (!worker) {
          return;
        }
        worker.postMessage({'cmd' : 'checkMailbox'});
      }
    };

  
  var proxiedJSCallArgs = [];
  
  var __emscripten_receive_on_main_thread_js = (index, callingThread, numCallArgs, args) => {
      // Sometimes we need to backproxy events to the calling thread (e.g.
      // HTML5 DOM events handlers such as
      // emscripten_set_mousemove_callback()), so keep track in a globally
      // accessible variable about the thread that initiated the proxying.
      numCallArgs /= 2;
      proxiedJSCallArgs.length = numCallArgs;
      var b = ((args)>>3);
      for (var i = 0; i < numCallArgs; i++) {
        if (HEAP64[b + 2*i]) {
          // It's a BigInt.
          proxiedJSCallArgs[i] = HEAP64[b + 2*i + 1];
        } else {
          // It's a Number.
          proxiedJSCallArgs[i] = HEAPF64[b + 2*i + 1];
        }
      }
      // Proxied JS library funcs are encoded as positive values, and
      // EM_ASMs as negative values (see include_asm_consts)
      var func = proxiedFunctionTable[index];
      PThread.currentProxiedOperationCallerThread = callingThread;
      var rtn = func.apply(null, proxiedJSCallArgs);
      PThread.currentProxiedOperationCallerThread = 0;
      return rtn;
    };

  
  function __emscripten_runtime_keepalive_clear() {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(38, 1);
  
      noExitRuntime = false;
      runtimeKeepaliveCounter = 0;
    
  }
  


  var __emscripten_thread_set_strongref = (thread) => {
      // Called when a thread needs to be strongly referenced.
      // Currently only used for:
      // - keeping the "main" thread alive in PROXY_TO_PTHREAD mode;
      // - crashed threads that needs to propagate the uncaught exception
      //   back to the main thread.
      if (ENVIRONMENT_IS_NODE) {
        PThread.pthreads[thread].ref();
      }
    };

  var __emscripten_throw_longjmp = () => {
      throw Infinity;
    };

  function __gmtime_js(time, tmPtr) {
    time = bigintToI53Checked(time);;
  
    
      var date = new Date(time * 1000);
      HEAP32[((tmPtr)>>2)] = date.getUTCSeconds();
      HEAP32[(((tmPtr)+(4))>>2)] = date.getUTCMinutes();
      HEAP32[(((tmPtr)+(8))>>2)] = date.getUTCHours();
      HEAP32[(((tmPtr)+(12))>>2)] = date.getUTCDate();
      HEAP32[(((tmPtr)+(16))>>2)] = date.getUTCMonth();
      HEAP32[(((tmPtr)+(20))>>2)] = date.getUTCFullYear()-1900;
      HEAP32[(((tmPtr)+(24))>>2)] = date.getUTCDay();
      var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
      var yday = ((date.getTime() - start) / (1000 * 60 * 60 * 24))|0;
      HEAP32[(((tmPtr)+(28))>>2)] = yday;
    ;
  }

  var isLeapYear = (year) => year%4 === 0 && (year%100 !== 0 || year%400 === 0);
  
  var MONTH_DAYS_LEAP_CUMULATIVE = [0,31,60,91,121,152,182,213,244,274,305,335];
  
  var MONTH_DAYS_REGULAR_CUMULATIVE = [0,31,59,90,120,151,181,212,243,273,304,334];
  var ydayFromDate = (date) => {
      var leap = isLeapYear(date.getFullYear());
      var monthDaysCumulative = (leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE);
      var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1; // -1 since it's days since Jan 1
  
      return yday;
    };
  
  function __localtime_js(time, tmPtr) {
    time = bigintToI53Checked(time);;
  
    
      var date = new Date(time*1000);
      HEAP32[((tmPtr)>>2)] = date.getSeconds();
      HEAP32[(((tmPtr)+(4))>>2)] = date.getMinutes();
      HEAP32[(((tmPtr)+(8))>>2)] = date.getHours();
      HEAP32[(((tmPtr)+(12))>>2)] = date.getDate();
      HEAP32[(((tmPtr)+(16))>>2)] = date.getMonth();
      HEAP32[(((tmPtr)+(20))>>2)] = date.getFullYear()-1900;
      HEAP32[(((tmPtr)+(24))>>2)] = date.getDay();
  
      var yday = ydayFromDate(date)|0;
      HEAP32[(((tmPtr)+(28))>>2)] = yday;
      HEAP32[(((tmPtr)+(36))>>2)] = -(date.getTimezoneOffset() * 60);
  
      // Attention: DST is in December in South, and some regions don't have DST at all.
      var start = new Date(date.getFullYear(), 0, 1);
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset))|0;
      HEAP32[(((tmPtr)+(32))>>2)] = dst;
    ;
  }

  
  
  var __mktime_js = function(tmPtr) {
  
    var ret = (() => { 
      var date = new Date(HEAP32[(((tmPtr)+(20))>>2)] + 1900,
                          HEAP32[(((tmPtr)+(16))>>2)],
                          HEAP32[(((tmPtr)+(12))>>2)],
                          HEAP32[(((tmPtr)+(8))>>2)],
                          HEAP32[(((tmPtr)+(4))>>2)],
                          HEAP32[((tmPtr)>>2)],
                          0);
  
      // There's an ambiguous hour when the time goes back; the tm_isdst field is
      // used to disambiguate it.  Date() basically guesses, so we fix it up if it
      // guessed wrong, or fill in tm_isdst with the guess if it's -1.
      var dst = HEAP32[(((tmPtr)+(32))>>2)];
      var guessedOffset = date.getTimezoneOffset();
      var start = new Date(date.getFullYear(), 0, 1);
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dstOffset = Math.min(winterOffset, summerOffset); // DST is in December in South
      if (dst < 0) {
        // Attention: some regions don't have DST at all.
        HEAP32[(((tmPtr)+(32))>>2)] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
      } else if ((dst > 0) != (dstOffset == guessedOffset)) {
        var nonDstOffset = Math.max(winterOffset, summerOffset);
        var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
        // Don't try setMinutes(date.getMinutes() + ...) -- it's messed up.
        date.setTime(date.getTime() + (trueOffset - guessedOffset)*60000);
      }
  
      HEAP32[(((tmPtr)+(24))>>2)] = date.getDay();
      var yday = ydayFromDate(date)|0;
      HEAP32[(((tmPtr)+(28))>>2)] = yday;
      // To match expected behavior, update fields from date
      HEAP32[((tmPtr)>>2)] = date.getSeconds();
      HEAP32[(((tmPtr)+(4))>>2)] = date.getMinutes();
      HEAP32[(((tmPtr)+(8))>>2)] = date.getHours();
      HEAP32[(((tmPtr)+(12))>>2)] = date.getDate();
      HEAP32[(((tmPtr)+(16))>>2)] = date.getMonth();
      HEAP32[(((tmPtr)+(20))>>2)] = date.getYear();
  
      var timeMs = date.getTime();
      if (isNaN(timeMs)) {
        setErrNo(61);
        return -1;
      }
      // Return time in microseconds
      return timeMs / 1000;
     })();
    return BigInt(ret);
  };

  
  
  
  
  
  
  
  function __mmap_js(len, prot, flags, fd, offset, allocated, addr) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(39, 1, len, prot, flags, fd, offset, allocated, addr);
  
    offset = bigintToI53Checked(offset);;
  
    
  try {
  
      if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd);
      var res = FS.mmap(stream, len, offset, prot, flags);
      var ptr = res.ptr;
      HEAP32[((allocated)>>2)] = res.allocated;
      HEAPU32[((addr)>>2)] = ptr;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  ;
  
  }
  

  
  
  
  function __msync_js(addr, len, prot, flags, fd, offset) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(40, 1, addr, len, prot, flags, fd, offset);
  
    offset = bigintToI53Checked(offset);;
  
    
  try {
  
      if (isNaN(offset)) return 61;
      SYSCALLS.doMsync(addr, SYSCALLS.getStreamFromFD(fd), len, flags, offset);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  ;
  
  }
  

  
  
  
  
  
  function __munmap_js(addr, len, prot, flags, fd, offset) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(41, 1, addr, len, prot, flags, fd, offset);
  
    offset = bigintToI53Checked(offset);;
  
    
  try {
  
      if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd);
      if (prot & 2) {
        SYSCALLS.doMsync(addr, stream, len, flags, offset);
      }
      FS.munmap(stream);
      // implicitly return 0
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  ;
  
  }
  

  
  
  var stringToNewUTF8 = (str) => {
      var size = lengthBytesUTF8(str) + 1;
      var ret = _malloc(size);
      if (ret) stringToUTF8(str, ret, size);
      return ret;
    };
  var __tzset_js = (timezone, daylight, tzname) => {
      // TODO: Use (malleable) environment variables instead of system settings.
      var currentYear = new Date().getFullYear();
      var winter = new Date(currentYear, 0, 1);
      var summer = new Date(currentYear, 6, 1);
      var winterOffset = winter.getTimezoneOffset();
      var summerOffset = summer.getTimezoneOffset();
  
      // Local standard timezone offset. Local standard time is not adjusted for daylight savings.
      // This code uses the fact that getTimezoneOffset returns a greater value during Standard Time versus Daylight Saving Time (DST).
      // Thus it determines the expected output during Standard Time, and it compares whether the output of the given date the same (Standard) or less (DST).
      var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
  
      // timezone is specified as seconds west of UTC ("The external variable
      // `timezone` shall be set to the difference, in seconds, between
      // Coordinated Universal Time (UTC) and local standard time."), the same
      // as returned by stdTimezoneOffset.
      // See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html
      HEAPU32[((timezone)>>2)] = stdTimezoneOffset * 60;
  
      HEAP32[((daylight)>>2)] = Number(winterOffset != summerOffset);
  
      function extractZone(date) {
        var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
        return match ? match[1] : "GMT";
      };
      var winterName = extractZone(winter);
      var summerName = extractZone(summer);
      var winterNamePtr = stringToNewUTF8(winterName);
      var summerNamePtr = stringToNewUTF8(summerName);
      if (summerOffset < winterOffset) {
        // Northern hemisphere
        HEAPU32[((tzname)>>2)] = winterNamePtr;
        HEAPU32[(((tzname)+(4))>>2)] = summerNamePtr;
      } else {
        HEAPU32[((tzname)>>2)] = summerNamePtr;
        HEAPU32[(((tzname)+(4))>>2)] = winterNamePtr;
      }
    };

  var _abort = () => {
      abort('');
    };

  var warnOnce = (text) => {
      if (!warnOnce.shown) warnOnce.shown = {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        if (ENVIRONMENT_IS_NODE) text = 'warning: ' + text;
        err(text);
      }
    };
  
  var _emscripten_check_blocking_allowed = () => {
    };

  var _emscripten_console_error = (str) => {
      console.error(UTF8ToString(str));
    };

  var _emscripten_date_now = () => Date.now();

  var _emscripten_exit_with_live_runtime = () => {
      runtimeKeepalivePush();
      throw 'unwind';
    };

  var runAndAbortIfError = (func) => {
      try {
        return func();
      } catch (e) {
        abort(e);
      }
    };
  
  
  var sigToWasmTypes = (sig) => {
      var typeNames = {
        'i': 'i32',
        'j': 'i64',
        'f': 'f32',
        'd': 'f64',
        'e': 'externref',
        'p': 'i32',
      };
      var type = {
        parameters: [],
        results: sig[0] == 'v' ? [] : [typeNames[sig[0]]]
      };
      for (var i = 1; i < sig.length; ++i) {
        type.parameters.push(typeNames[sig[i]]);
      }
      return type;
    };
  
  
  
  
  
  
  var Asyncify = {
  instrumentWasmImports(imports) {
        var importPattern = /^(invoke_.*|__asyncjs__.*)$/;
  
        for (var x in imports) {
          (function(x) {
            var original = imports[x];
            var sig = original.sig;
            if (typeof original == 'function') {
              var isAsyncifyImport = original.isAsync || importPattern.test(x);
            }
          })(x);
        }
      },
  instrumentWasmExports(exports) {
        var ret = {};
        for (var x in exports) {
          (function(x) {
            var original = exports[x];
            if (typeof original == 'function') {
              ret[x] = function() {
                Asyncify.exportCallStack.push(x);
                try {
                  return original.apply(null, arguments);
                } finally {
                  if (!ABORT) {
                    var y = Asyncify.exportCallStack.pop();
                    Asyncify.maybeStopUnwind();
                  }
                }
              };
            } else {
              ret[x] = original;
            }
          })(x);
        }
        return ret;
      },
  State:{
  Normal:0,
  Unwinding:1,
  Rewinding:2,
  Disabled:3,
  },
  state:0,
  StackSize:4096,
  currData:null,
  handleSleepReturnValue:0,
  exportCallStack:[],
  callStackNameToId:{
  },
  callStackIdToName:{
  },
  callStackId:0,
  asyncPromiseHandlers:null,
  sleepCallbacks:[],
  getCallStackId(funcName) {
        var id = Asyncify.callStackNameToId[funcName];
        if (id === undefined) {
          id = Asyncify.callStackId++;
          Asyncify.callStackNameToId[funcName] = id;
          Asyncify.callStackIdToName[id] = funcName;
        }
        return id;
      },
  maybeStopUnwind() {
        if (Asyncify.currData &&
            Asyncify.state === Asyncify.State.Unwinding &&
            Asyncify.exportCallStack.length === 0) {
          // We just finished unwinding.
          // Be sure to set the state before calling any other functions to avoid
          // possible infinite recursion here (For example in debug pthread builds
          // the dbg() function itself can call back into WebAssembly to get the
          // current pthread_self() pointer).
          Asyncify.state = Asyncify.State.Normal;
          runtimeKeepalivePush();
          // Keep the runtime alive so that a re-wind can be done later.
          runAndAbortIfError(_asyncify_stop_unwind);
          if (typeof Fibers != 'undefined') {
            Fibers.trampoline();
          }
        }
      },
  whenDone() {
        return new Promise((resolve, reject) => {
          Asyncify.asyncPromiseHandlers = { resolve, reject };
        });
      },
  allocateData() {
        // An asyncify data structure has three fields:
        //  0  current stack pos
        //  4  max stack pos
        //  8  id of function at bottom of the call stack (callStackIdToName[id] == name of js function)
        //
        // The Asyncify ABI only interprets the first two fields, the rest is for the runtime.
        // We also embed a stack in the same memory region here, right next to the structure.
        // This struct is also defined as asyncify_data_t in emscripten/fiber.h
        var ptr = _malloc(12 + Asyncify.StackSize);
        Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
        Asyncify.setDataRewindFunc(ptr);
        return ptr;
      },
  setDataHeader(ptr, stack, stackSize) {
        HEAPU32[((ptr)>>2)] = stack;
        HEAPU32[(((ptr)+(4))>>2)] = stack + stackSize;
      },
  setDataRewindFunc(ptr) {
        var bottomOfCallStack = Asyncify.exportCallStack[0];
        var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
        HEAP32[(((ptr)+(8))>>2)] = rewindId;
      },
  getDataRewindFunc(ptr) {
        var id = HEAP32[(((ptr)+(8))>>2)];
        var name = Asyncify.callStackIdToName[id];
        var func = wasmExports[name];
        return func;
      },
  doRewind(ptr) {
        var start = Asyncify.getDataRewindFunc(ptr);
        // Once we have rewound and the stack we no longer need to artificially
        // keep the runtime alive.
        runtimeKeepalivePop();
        return start();
      },
  handleSleep(startAsync) {
        if (ABORT) return;
        if (Asyncify.state === Asyncify.State.Normal) {
          // Prepare to sleep. Call startAsync, and see what happens:
          // if the code decided to call our callback synchronously,
          // then no async operation was in fact begun, and we don't
          // need to do anything.
          var reachedCallback = false;
          var reachedAfterCallback = false;
          startAsync((handleSleepReturnValue = 0) => {
            if (ABORT) return;
            Asyncify.handleSleepReturnValue = handleSleepReturnValue;
            reachedCallback = true;
            if (!reachedAfterCallback) {
              // We are happening synchronously, so no need for async.
              return;
            }
            Asyncify.state = Asyncify.State.Rewinding;
            runAndAbortIfError(() => _asyncify_start_rewind(Asyncify.currData));
            if (typeof Browser != 'undefined' && Browser.mainLoop.func) {
              Browser.mainLoop.resume();
            }
            var asyncWasmReturnValue, isError = false;
            try {
              asyncWasmReturnValue = Asyncify.doRewind(Asyncify.currData);
            } catch (err) {
              asyncWasmReturnValue = err;
              isError = true;
            }
            // Track whether the return value was handled by any promise handlers.
            var handled = false;
            if (!Asyncify.currData) {
              // All asynchronous execution has finished.
              // `asyncWasmReturnValue` now contains the final
              // return value of the exported async WASM function.
              //
              // Note: `asyncWasmReturnValue` is distinct from
              // `Asyncify.handleSleepReturnValue`.
              // `Asyncify.handleSleepReturnValue` contains the return
              // value of the last C function to have executed
              // `Asyncify.handleSleep()`, where as `asyncWasmReturnValue`
              // contains the return value of the exported WASM function
              // that may have called C functions that
              // call `Asyncify.handleSleep()`.
              var asyncPromiseHandlers = Asyncify.asyncPromiseHandlers;
              if (asyncPromiseHandlers) {
                Asyncify.asyncPromiseHandlers = null;
                (isError ? asyncPromiseHandlers.reject : asyncPromiseHandlers.resolve)(asyncWasmReturnValue);
                handled = true;
              }
            }
            if (isError && !handled) {
              // If there was an error and it was not handled by now, we have no choice but to
              // rethrow that error into the global scope where it can be caught only by
              // `onerror` or `onunhandledpromiserejection`.
              throw asyncWasmReturnValue;
            }
          });
          reachedAfterCallback = true;
          if (!reachedCallback) {
            // A true async operation was begun; start a sleep.
            Asyncify.state = Asyncify.State.Unwinding;
            // TODO: reuse, don't alloc/free every sleep
            Asyncify.currData = Asyncify.allocateData();
            if (typeof Browser != 'undefined' && Browser.mainLoop.func) {
              Browser.mainLoop.pause();
            }
            runAndAbortIfError(() => _asyncify_start_unwind(Asyncify.currData));
          }
        } else if (Asyncify.state === Asyncify.State.Rewinding) {
          // Stop a resume.
          Asyncify.state = Asyncify.State.Normal;
          runAndAbortIfError(_asyncify_stop_rewind);
          _free(Asyncify.currData);
          Asyncify.currData = null;
          // Call all sleep callbacks now that the sleep-resume is all done.
          Asyncify.sleepCallbacks.forEach((func) => callUserCallback(func));
        } else {
          abort(`invalid state: ${Asyncify.state}`);
        }
        return Asyncify.handleSleepReturnValue;
      },
  handleAsync(startAsync) {
        return Asyncify.handleSleep((wakeUp) => {
          // TODO: add error handling as a second param when handleSleep implements it.
          startAsync().then(wakeUp);
        });
      },
  };
  
  
  var Fibers = {
  nextFiber:0,
  trampolineRunning:false,
  trampoline() {
        if (!Fibers.trampolineRunning && Fibers.nextFiber) {
          Fibers.trampolineRunning = true;
          do {
            var fiber = Fibers.nextFiber;
            Fibers.nextFiber = 0;
            Fibers.finishContextSwitch(fiber);
          } while (Fibers.nextFiber);
          Fibers.trampolineRunning = false;
        }
      },
  finishContextSwitch(newFiber) {
        var stack_base = HEAPU32[((newFiber)>>2)];
        var stack_max =  HEAPU32[(((newFiber)+(4))>>2)];
        _emscripten_stack_set_limits(stack_base, stack_max);
  
        stackRestore(HEAPU32[(((newFiber)+(8))>>2)]);
  
        var entryPoint = HEAPU32[(((newFiber)+(12))>>2)];
  
        if (entryPoint !== 0) {
          Asyncify.currData = null;
          HEAPU32[(((newFiber)+(12))>>2)] = 0;
  
          var userData = HEAPU32[(((newFiber)+(16))>>2)];
          ((a1) => dynCall_vi.apply(null, [entryPoint, a1]))(userData);
        } else {
          var asyncifyData = newFiber + 20;
          Asyncify.currData = asyncifyData;
  
          Asyncify.state = Asyncify.State.Rewinding;
          _asyncify_start_rewind(asyncifyData);
          Asyncify.doRewind(asyncifyData);
        }
      },
  };
  var _emscripten_fiber_swap = (oldFiber, newFiber) => {
      if (ABORT) return;
      if (Asyncify.state === Asyncify.State.Normal) {
        Asyncify.state = Asyncify.State.Unwinding;
  
        var asyncifyData = oldFiber + 20;
        Asyncify.setDataRewindFunc(asyncifyData);
        Asyncify.currData = asyncifyData;
  
        _asyncify_start_unwind(asyncifyData);
  
        var stackTop = stackSave();
        HEAPU32[(((oldFiber)+(8))>>2)] = stackTop;
  
        Fibers.nextFiber = newFiber;
      } else {
        Asyncify.state = Asyncify.State.Normal;
        _asyncify_stop_rewind();
        Asyncify.currData = null;
      }
    };
  _emscripten_fiber_swap.isAsync = true;

  var getHeapMax = () =>
      HEAPU8.length;
  var _emscripten_get_heap_max = () => getHeapMax();

  var _emscripten_get_now;
      // Pthreads need their clocks synchronized to the execution of the main
      // thread, so, when using them, make sure to adjust all timings to the
      // respective time origins.
      _emscripten_get_now = () => performance.timeOrigin + performance.now();
  ;

  var _emscripten_num_logical_cores = () => {
      if (ENVIRONMENT_IS_NODE) return require('os').cpus().length;
      return navigator['hardwareConcurrency'];
    };

  
  var abortOnCannotGrowMemory = (requestedSize) => {
      abort('OOM');
    };
  var _emscripten_resize_heap = (requestedSize) => {
      var oldSize = HEAPU8.length;
      // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
      requestedSize >>>= 0;
      abortOnCannotGrowMemory(requestedSize);
    };

  var _emscripten_runtime_keepalive_check = keepRuntimeAlive;

  var ENV = {
  TERM:"xterm-256color",
  };
  
  var getExecutableName = () => {
      return thisProgram || './this.program';
    };
  var getEnvStrings = () => {
      if (!getEnvStrings.strings) {
        // Default values.
        // Browser language detection #8751
        var lang = ((typeof navigator == 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') + '.UTF-8';
        var env = {
          'USER': 'web_user',
          'LOGNAME': 'web_user',
          'PATH': '/',
          'PWD': '/',
          'HOME': '/home/web_user',
          'LANG': lang,
          '_': getExecutableName()
        };
        // Apply the user-provided values, if any.
        for (var x in ENV) {
          // x is a key in ENV; if ENV[x] is undefined, that means it was
          // explicitly set to be so. We allow user code to do that to
          // force variables with default values to remain unset.
          if (ENV[x] === undefined) delete env[x];
          else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(`${x}=${env[x]}`);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    };
  
  var stringToAscii = (str, buffer) => {
      for (var i = 0; i < str.length; ++i) {
        HEAP8[((buffer++)>>0)] = str.charCodeAt(i);
      }
      // Null-terminate the string
      HEAP8[((buffer)>>0)] = 0;
    };
  
  
  var _environ_get = 
  function(__environ, environ_buf) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(42, 1, __environ, environ_buf);
  
      var bufSize = 0;
      getEnvStrings().forEach((string, i) => {
        var ptr = environ_buf + bufSize;
        HEAPU32[(((__environ)+(i*4))>>2)] = ptr;
        stringToAscii(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    
  }
  ;

  
  
  var _environ_sizes_get = 
  function(penviron_count, penviron_buf_size) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(43, 1, penviron_count, penviron_buf_size);
  
      var strings = getEnvStrings();
      HEAPU32[((penviron_count)>>2)] = strings.length;
      var bufSize = 0;
      strings.forEach((string) => bufSize += string.length + 1);
      HEAPU32[((penviron_buf_size)>>2)] = bufSize;
      return 0;
    
  }
  ;


  
  
  function _fd_close(fd) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(44, 1, fd);
  
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  
  }
  

  
  
  function _fd_fdstat_get(fd, pbuf) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(45, 1, fd, pbuf);
  
  try {
  
      var rightsBase = 0;
      var rightsInheriting = 0;
      var flags = 0;
      {
        var stream = SYSCALLS.getStreamFromFD(fd);
        // All character devices are terminals (other things a Linux system would
        // assume is a character device, like the mouse, we have special APIs for).
        var type = stream.tty ? 2 :
                   FS.isDir(stream.mode) ? 3 :
                   FS.isLink(stream.mode) ? 7 :
                   4;
      }
      HEAP8[((pbuf)>>0)] = type;
      HEAP16[(((pbuf)+(2))>>1)] = flags;
      HEAP64[(((pbuf)+(8))>>3)] = BigInt(rightsBase);
      HEAP64[(((pbuf)+(16))>>3)] = BigInt(rightsInheriting);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  
  }
  

  /** @param {number=} offset */
  var doReadv = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) break; // nothing more to read
        if (typeof offset !== 'undefined') {
          offset += curr;
        }
      }
      return ret;
    };
  
  
  
  
  function _fd_pread(fd, iov, iovcnt, offset, pnum) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(46, 1, fd, iov, iovcnt, offset, pnum);
  
    offset = bigintToI53Checked(offset);;
  
    
  try {
  
      if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd)
      var num = doReadv(stream, iov, iovcnt, offset);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  ;
  
  }
  

  /** @param {number=} offset */
  var doWritev = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (typeof offset !== 'undefined') {
          offset += curr;
        }
      }
      return ret;
    };
  
  
  
  
  function _fd_pwrite(fd, iov, iovcnt, offset, pnum) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(47, 1, fd, iov, iovcnt, offset, pnum);
  
    offset = bigintToI53Checked(offset);;
  
    
  try {
  
      if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd)
      var num = doWritev(stream, iov, iovcnt, offset);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  ;
  
  }
  

  
  
  
  
  
  function xterm_pty_old_fd_read(fd, iov, iovcnt, pnum) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(48, 1, fd, iov, iovcnt, pnum);
  
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doReadv(stream, iov, iovcnt);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  
  }
  
  var _fd_read = (fd, iov, iovcnt, pnum) => PTY_handleSleep((wakeUp) => {
          let result = xterm_pty_old_fd_read(fd, iov, iovcnt, pnum);
          // Did this call return our variant of EAGAIN?
          // If so, that means it called into the PTY and the buffer was empty.
          if (result === 1006) {
              // Wait for the PTY to become readable and try again.
              PTY_waitForReadable((type) => {
                  switch (type) {
                      case 0: /* ready */
  			wakeUp(xterm_pty_old_fd_read(fd, iov, iovcnt, pnum));
                          break;
                      case 1: /* interrupted */
                          wakeUp(27);
                          break;
                      case 2: /* timeout */
                          wakeUp(0);
                          break;
                  }
  	    });
          } else {
              wakeUp(result);
          }
      });

  
  
  
  function _fd_seek(fd, offset, whence, newOffset) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(49, 1, fd, offset, whence, newOffset);
  
    offset = bigintToI53Checked(offset);;
  
    
  try {
  
      if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.llseek(stream, offset, whence);
      HEAP64[((newOffset)>>3)] = BigInt(stream.position);
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  ;
  
  }
  

  
  var _fd_sync = 
  function(fd) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(50, 1, fd);
  
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      return Asyncify.handleSleep((wakeUp) => {
        var mount = stream.node.mount;
        if (!mount.type.syncfs) {
          // We write directly to the file system, so there's nothing to do here.
          wakeUp(0);
          return;
        }
        mount.type.syncfs(mount, false, (err) => {
          if (err) {
            wakeUp(29);
            return;
          }
          wakeUp(0);
        });
      });
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  
  }
  ;
  _fd_sync.isAsync = true;

  
  
  
  function _fd_write(fd, iov, iovcnt, pnum) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(51, 1, fd, iov, iovcnt, pnum);
  
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doWritev(stream, iov, iovcnt);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  
  }
  

  
  
  
  
  
  
  
  
  
  
  
  function _getaddrinfo(node, service, hint, out) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(52, 1, node, service, hint, out);
  
      // Note getaddrinfo currently only returns a single addrinfo with ai_next defaulting to NULL. When NULL
      // hints are specified or ai_family set to AF_UNSPEC or ai_socktype or ai_protocol set to 0 then we
      // really should provide a linked list of suitable addrinfo values.
      var addrs = [];
      var canon = null;
      var addr = 0;
      var port = 0;
      var flags = 0;
      var family = 0;
      var type = 0;
      var proto = 0;
      var ai, last;
  
      function allocaddrinfo(family, type, proto, canon, addr, port) {
        var sa, salen, ai;
        var errno;
  
        salen = family === 10 ?
          28 :
          16;
        addr = family === 10 ?
          inetNtop6(addr) :
          inetNtop4(addr);
        sa = _malloc(salen);
        errno = writeSockaddr(sa, family, addr, port);
        assert(!errno);
  
        ai = _malloc(32);
        HEAP32[(((ai)+(4))>>2)] = family;
        HEAP32[(((ai)+(8))>>2)] = type;
        HEAP32[(((ai)+(12))>>2)] = proto;
        HEAPU32[(((ai)+(24))>>2)] = canon;
        HEAPU32[(((ai)+(20))>>2)] = sa;
        if (family === 10) {
          HEAP32[(((ai)+(16))>>2)] = 28;
        } else {
          HEAP32[(((ai)+(16))>>2)] = 16;
        }
        HEAP32[(((ai)+(28))>>2)] = 0;
  
        return ai;
      }
  
      if (hint) {
        flags = HEAP32[((hint)>>2)];
        family = HEAP32[(((hint)+(4))>>2)];
        type = HEAP32[(((hint)+(8))>>2)];
        proto = HEAP32[(((hint)+(12))>>2)];
      }
      if (type && !proto) {
        proto = type === 2 ? 17 : 6;
      }
      if (!type && proto) {
        type = proto === 17 ? 2 : 1;
      }
  
      // If type or proto are set to zero in hints we should really be returning multiple addrinfo values, but for
      // now default to a TCP STREAM socket so we can at least return a sensible addrinfo given NULL hints.
      if (proto === 0) {
        proto = 6;
      }
      if (type === 0) {
        type = 1;
      }
  
      if (!node && !service) {
        return -2;
      }
      if (flags & ~(1|2|4|
          1024|8|16|32)) {
        return -1;
      }
      if (hint !== 0 && (HEAP32[((hint)>>2)] & 2) && !node) {
        return -1;
      }
      if (flags & 32) {
        // TODO
        return -2;
      }
      if (type !== 0 && type !== 1 && type !== 2) {
        return -7;
      }
      if (family !== 0 && family !== 2 && family !== 10) {
        return -6;
      }
  
      if (service) {
        service = UTF8ToString(service);
        port = parseInt(service, 10);
  
        if (isNaN(port)) {
          if (flags & 1024) {
            return -2;
          }
          // TODO support resolving well-known service names from:
          // http://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.txt
          return -8;
        }
      }
  
      if (!node) {
        if (family === 0) {
          family = 2;
        }
        if ((flags & 1) === 0) {
          if (family === 2) {
            addr = _htonl(2130706433);
          } else {
            addr = [0, 0, 0, 1];
          }
        }
        ai = allocaddrinfo(family, type, proto, null, addr, port);
        HEAPU32[((out)>>2)] = ai;
        return 0;
      }
  
      //
      // try as a numeric address
      //
      node = UTF8ToString(node);
      addr = inetPton4(node);
      if (addr !== null) {
        // incoming node is a valid ipv4 address
        if (family === 0 || family === 2) {
          family = 2;
        }
        else if (family === 10 && (flags & 8)) {
          addr = [0, 0, _htonl(0xffff), addr];
          family = 10;
        } else {
          return -2;
        }
      } else {
        addr = inetPton6(node);
        if (addr !== null) {
          // incoming node is a valid ipv6 address
          if (family === 0 || family === 10) {
            family = 10;
          } else {
            return -2;
          }
        }
      }
      if (addr != null) {
        ai = allocaddrinfo(family, type, proto, node, addr, port);
        HEAPU32[((out)>>2)] = ai;
        return 0;
      }
      if (flags & 4) {
        return -2;
      }
  
      //
      // try as a hostname
      //
      // resolve the hostname to a temporary fake address
      node = DNS.lookup_name(node);
      addr = inetPton4(node);
      if (family === 0) {
        family = 2;
      } else if (family === 10) {
        addr = [0, 0, _htonl(0xffff), addr];
      }
      ai = allocaddrinfo(family, type, proto, null, addr, port);
      HEAPU32[((out)>>2)] = ai;
      return 0;
    
  }
  

  var _getentropy = (buffer, size) => {
      randomFill(HEAPU8.subarray(buffer, buffer + size));
      return 0;
    };

  
  
  
  var getHostByName = (name) => {
      // generate hostent
      var ret = _malloc(20); // XXX possibly leaked, as are others here
      var nameBuf = stringToNewUTF8(name);
      HEAPU32[((ret)>>2)] = nameBuf;
      var aliasesBuf = _malloc(4);
      HEAPU32[((aliasesBuf)>>2)] = 0;
      HEAPU32[(((ret)+(4))>>2)] = aliasesBuf;
      var afinet = 2;
      HEAP32[(((ret)+(8))>>2)] = afinet;
      HEAP32[(((ret)+(12))>>2)] = 4;
      var addrListBuf = _malloc(12);
      HEAPU32[((addrListBuf)>>2)] = addrListBuf+8;
      HEAPU32[(((addrListBuf)+(4))>>2)] = 0;
      HEAP32[(((addrListBuf)+(8))>>2)] = inetPton4(DNS.lookup_name(name));
      HEAPU32[(((ret)+(16))>>2)] = addrListBuf;
      return ret;
    };
  
  
  
  function _gethostbyname(name) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(53, 1, name);
  return getHostByName(UTF8ToString(name))
  }
  

  
  
  
  var _getnameinfo = (sa, salen, node, nodelen, serv, servlen, flags) => {
      var info = readSockaddr(sa, salen);
      if (info.errno) {
        return -6;
      }
      var port = info.port;
      var addr = info.addr;
  
      var overflowed = false;
  
      if (node && nodelen) {
        var lookup;
        if ((flags & 1) || !(lookup = DNS.lookup_addr(addr))) {
          if (flags & 8) {
            return -2;
          }
        } else {
          addr = lookup;
        }
        var numBytesWrittenExclNull = stringToUTF8(addr, node, nodelen);
  
        if (numBytesWrittenExclNull+1 >= nodelen) {
          overflowed = true;
        }
      }
  
      if (serv && servlen) {
        port = '' + port;
        var numBytesWrittenExclNull = stringToUTF8(port, serv, servlen);
  
        if (numBytesWrittenExclNull+1 >= servlen) {
          overflowed = true;
        }
      }
  
      if (overflowed) {
        // Note: even when we overflow, getnameinfo() is specced to write out the truncated results.
        return -12;
      }
  
      return 0;
    };


  
  var arraySum = (array, index) => {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]) {
        // no-op
      }
      return sum;
    };
  
  
  var MONTH_DAYS_LEAP = [31,29,31,30,31,30,31,31,30,31,30,31];
  
  var MONTH_DAYS_REGULAR = [31,28,31,30,31,30,31,31,30,31,30,31];
  var addDays = (date, days) => {
      var newDate = new Date(date.getTime());
      while (days > 0) {
        var leap = isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
  
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
  
      return newDate;
    };
  
  
  
  
  var writeArrayToMemory = (array, buffer) => {
      HEAP8.set(array, buffer);
    };
  
  var _strftime = (s, maxsize, format, tm) => {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
  
      var tm_zone = HEAPU32[(((tm)+(40))>>2)];
  
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)],
        tm_gmtoff: HEAP32[(((tm)+(36))>>2)],
        tm_zone: tm_zone ? UTF8ToString(tm_zone) : ''
      };
      
  
      var pattern = UTF8ToString(format);
  
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate time representation
        // Modified Conversion Specifiers
        '%Ec': '%c',                      // Replaced by the locale's alternative appropriate date and time representation.
        '%EC': '%C',                      // Replaced by the name of the base year (period) in the locale's alternative representation.
        '%Ex': '%m/%d/%y',                // Replaced by the locale's alternative date representation.
        '%EX': '%H:%M:%S',                // Replaced by the locale's alternative time representation.
        '%Ey': '%y',                      // Replaced by the offset from %EC (year only) in the locale's alternative representation.
        '%EY': '%Y',                      // Replaced by the full alternative year representation.
        '%Od': '%d',                      // Replaced by the day of the month, using the locale's alternative numeric symbols, filled as needed with leading zeros if there is any alternative symbol for zero; otherwise, with leading <space> characters.
        '%Oe': '%e',                      // Replaced by the day of the month, using the locale's alternative numeric symbols, filled as needed with leading <space> characters.
        '%OH': '%H',                      // Replaced by the hour (24-hour clock) using the locale's alternative numeric symbols.
        '%OI': '%I',                      // Replaced by the hour (12-hour clock) using the locale's alternative numeric symbols.
        '%Om': '%m',                      // Replaced by the month using the locale's alternative numeric symbols.
        '%OM': '%M',                      // Replaced by the minutes using the locale's alternative numeric symbols.
        '%OS': '%S',                      // Replaced by the seconds using the locale's alternative numeric symbols.
        '%Ou': '%u',                      // Replaced by the weekday as a number in the locale's alternative representation (Monday=1).
        '%OU': '%U',                      // Replaced by the week number of the year (Sunday as the first day of the week, rules corresponding to %U ) using the locale's alternative numeric symbols.
        '%OV': '%V',                      // Replaced by the week number of the year (Monday as the first day of the week, rules corresponding to %V ) using the locale's alternative numeric symbols.
        '%Ow': '%w',                      // Replaced by the number of the weekday (Sunday=0) using the locale's alternative numeric symbols.
        '%OW': '%W',                      // Replaced by the week number of the year (Monday as the first day of the week) using the locale's alternative numeric symbols.
        '%Oy': '%y',                      // Replaced by the year (offset from %C ) using the locale's alternative numeric symbols.
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
  
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
      function leadingSomething(value, digits, character) {
        var str = typeof value == 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      }
  
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      }
  
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        }
  
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      }
  
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      }
  
      function getWeekBasedYear(date) {
          var thisDate = addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            }
            return thisDate.getFullYear();
          }
          return thisDate.getFullYear()-1;
      }
  
      var EXPANSION_RULES_2 = {
        '%a': (date) => WEEKDAYS[date.tm_wday].substring(0,3) ,
        '%A': (date) => WEEKDAYS[date.tm_wday],
        '%b': (date) => MONTHS[date.tm_mon].substring(0,3),
        '%B': (date) => MONTHS[date.tm_mon],
        '%C': (date) => {
          var year = date.tm_year+1900;
          return leadingNulls((year/100)|0,2);
        },
        '%d': (date) => leadingNulls(date.tm_mday, 2),
        '%e': (date) => leadingSomething(date.tm_mday, 2, ' '),
        '%g': (date) => {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year.
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes
          // January 4th, which is also the week that includes the first Thursday of the year, and
          // is also the first week that contains at least four days in the year.
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of
          // the last week of the preceding year; thus, for Saturday 2nd January 1999,
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th,
          // or 31st is a Monday, it and any following days are part of week 1 of the following year.
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
  
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': (date) => getWeekBasedYear(date),
        '%H': (date) => leadingNulls(date.tm_hour, 2),
        '%I': (date) => {
          var twelveHour = date.tm_hour;
          if (twelveHour == 0) twelveHour = 12;
          else if (twelveHour > 12) twelveHour -= 12;
          return leadingNulls(twelveHour, 2);
        },
        '%j': (date) => {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday + arraySum(isLeapYear(date.tm_year+1900) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': (date) => leadingNulls(date.tm_mon+1, 2),
        '%M': (date) => leadingNulls(date.tm_min, 2),
        '%n': () => '\n',
        '%p': (date) => {
          if (date.tm_hour >= 0 && date.tm_hour < 12) {
            return 'AM';
          }
          return 'PM';
        },
        '%S': (date) => leadingNulls(date.tm_sec, 2),
        '%t': () => '\t',
        '%u': (date) => date.tm_wday || 7,
        '%U': (date) => {
          var days = date.tm_yday + 7 - date.tm_wday;
          return leadingNulls(Math.floor(days / 7), 2);
        },
        '%V': (date) => {
          // Replaced by the week number of the year (Monday as the first day of the week)
          // as a decimal number [01,53]. If the week containing 1 January has four
          // or more days in the new year, then it is considered week 1.
          // Otherwise, it is the last week of the previous year, and the next week is week 1.
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var val = Math.floor((date.tm_yday + 7 - (date.tm_wday + 6) % 7 ) / 7);
          // If 1 Jan is just 1-3 days past Monday, the previous week
          // is also in this year.
          if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
            val++;
          }
          if (!val) {
            val = 52;
            // If 31 December of prev year a Thursday, or Friday of a
            // leap year, then the prev year has 53 weeks.
            var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
            if (dec31 == 4 || (dec31 == 5 && isLeapYear(date.tm_year%400-1))) {
              val++;
            }
          } else if (val == 53) {
            // If 1 January is not a Thursday, and not a Wednesday of a
            // leap year, then this year has only 52 weeks.
            var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
            if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date.tm_year)))
              val = 1;
          }
          return leadingNulls(val, 2);
        },
        '%w': (date) => date.tm_wday,
        '%W': (date) => {
          var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
          return leadingNulls(Math.floor(days / 7), 2);
        },
        '%y': (date) => {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
        '%Y': (date) => date.tm_year+1900,
        '%z': (date) => {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ).
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich).
          var off = date.tm_gmtoff;
          var ahead = off >= 0;
          off = Math.abs(off) / 60;
          // convert from minutes into hhmm format (which means 60 minutes = 100 units)
          off = (off / 60)*100 + (off % 60);
          return (ahead ? '+' : '-') + String("0000" + off).slice(-4);
        },
        '%Z': (date) => date.tm_zone,
        '%%': () => '%'
      };
  
      // Replace %% with a pair of NULLs (which cannot occur in a C string), then
      // re-inject them after processing.
      pattern = pattern.replace(/%%/g, '\0\0')
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.includes(rule)) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
      pattern = pattern.replace(/\0\0/g, '%')
  
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      }
  
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    };

  
  var _system = (command) => {
      if (ENVIRONMENT_IS_NODE) {
        if (!command) return 1; // shell is available
  
        var cmdstr = UTF8ToString(command);
        if (!cmdstr.length) return 0; // this is what glibc seems to do (shell works test?)
  
        var cp = require('child_process');
        var ret = cp.spawnSync(cmdstr, [], {shell:true, stdio:'inherit'});
  
        var _W_EXITCODE = (ret, sig) => ((ret) << 8 | (sig));
  
        // this really only can happen if process is killed by signal
        if (ret.status === null) {
          // sadly node doesn't expose such function
          var signalToNumber = (sig) => {
            // implement only the most common ones, and fallback to SIGINT
            switch (sig) {
              case 'SIGHUP': return 1;
              case 'SIGINT': return 2;
              case 'SIGQUIT': return 3;
              case 'SIGFPE': return 8;
              case 'SIGKILL': return 9;
              case 'SIGALRM': return 14;
              case 'SIGTERM': return 15;
            }
            return 2; // SIGINT
          }
          return _W_EXITCODE(0, signalToNumber(ret.signal));
        }
  
        return _W_EXITCODE(ret.status, 0);
      }
      // int system(const char *command);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/system.html
      // Can't call external programs.
      if (!command) return 0; // no shell available
      setErrNo(52);
      return -1;
    };



  
  var stringToUTF8OnStack = (str) => {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8(str, ret, size);
      return ret;
    };

  var wasmTableMirror = [];
  
  var wasmTable;
  var getWasmTableEntry = (funcPtr) => {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      return func;
    };

  
  var setWasmTableEntry = (idx, func) => {
      wasmTable.set(idx, func);
      // With ABORT_ON_WASM_EXCEPTIONS wasmTable.get is overriden to return wrapped
      // functions so we need to call it here to retrieve the potential wrapper correctly
      // instead of just storing 'func' directly into wasmTableMirror
      wasmTableMirror[idx] = wasmTable.get(idx);
    };

  var freeTableIndexes = [];
  
  var getEmptyTableSlot = () => {
      // Reuse a free index if there is one, otherwise grow.
      if (freeTableIndexes.length) {
        return freeTableIndexes.pop();
      }
      // Grow the table
      try {
        wasmTable.grow(1);
      } catch (err) {
        if (!(err instanceof RangeError)) {
          throw err;
        }
        throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
      }
      return wasmTable.length - 1;
    };

  var uleb128Encode = (n, target) => {
      if (n < 128) {
        target.push(n);
      } else {
        target.push((n % 128) | 128, n >> 7);
      }
    };
  
  
  var generateFuncType = (sig, target) => {
      var sigRet = sig.slice(0, 1);
      var sigParam = sig.slice(1);
      var typeCodes = {
        'i': 0x7f, // i32
        'p': 0x7f, // i32
        'j': 0x7e, // i64
        'f': 0x7d, // f32
        'd': 0x7c, // f64
        'e': 0x6f, // externref
      };
  
      // Parameters, length + signatures
      target.push(0x60 /* form: func */);
      uleb128Encode(sigParam.length, target);
      for (var i = 0; i < sigParam.length; ++i) {
        target.push(typeCodes[sigParam[i]]);
      }
  
      // Return values, length + signatures
      // With no multi-return in MVP, either 0 (void) or 1 (anything else)
      if (sigRet == 'v') {
        target.push(0x00);
      } else {
        target.push(0x01, typeCodes[sigRet]);
      }
    };
  var convertJsFunctionToWasm = (func, sig) => {
  
      // If the type reflection proposal is available, use the new
      // "WebAssembly.Function" constructor.
      // Otherwise, construct a minimal wasm module importing the JS function and
      // re-exporting it.
      if (typeof WebAssembly.Function == "function") {
        return new WebAssembly.Function(sigToWasmTypes(sig), func);
      }
  
      // The module is static, with the exception of the type section, which is
      // generated based on the signature passed in.
      var typeSectionBody = [
        0x01, // count: 1
      ];
      generateFuncType(sig, typeSectionBody);
  
      // Rest of the module is static
      var bytes = [
        0x00, 0x61, 0x73, 0x6d, // magic ("\0asm")
        0x01, 0x00, 0x00, 0x00, // version: 1
        0x01, // Type section code
      ];
      // Write the overall length of the type section followed by the body
      uleb128Encode(typeSectionBody.length, bytes);
      bytes.push.apply(bytes, typeSectionBody);
  
      // The rest of the module is static
      bytes.push(
        0x02, 0x07, // import section
          // (import "e" "f" (func 0 (type 0)))
          0x01, 0x01, 0x65, 0x01, 0x66, 0x00, 0x00,
        0x07, 0x05, // export section
          // (export "f" (func 0 (type 0)))
          0x01, 0x01, 0x66, 0x00, 0x00,
      );
  
      // We can compile this wasm module synchronously because it is very small.
      // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
      var module = new WebAssembly.Module(new Uint8Array(bytes));
      var instance = new WebAssembly.Instance(module, { 'e': { 'f': func } });
      var wrappedFunc = instance.exports['f'];
      return wrappedFunc;
    };




  
  
  var updateTableMap = (offset, count) => {
      if (functionsInTableMap) {
        for (var i = offset; i < offset + count; i++) {
          var item = getWasmTableEntry(i);
          // Ignore null values.
          if (item) {
            functionsInTableMap.set(item, i);
          }
        }
      }
    };
  
  var functionsInTableMap;
  
  var getFunctionAddress = (func) => {
      // First, create the map if this is the first use.
      if (!functionsInTableMap) {
        functionsInTableMap = new WeakMap();
        updateTableMap(0, wasmTable.length);
      }
      return functionsInTableMap.get(func) || 0;
    };
  
  
  
  
  
  /** @param {string=} sig */
  var addFunction = (func, sig) => {
      // Check if the function is already in the table, to ensure each function
      // gets a unique index.
      var rtn = getFunctionAddress(func);
      if (rtn) {
        return rtn;
      }
  
      // It's not in the table, add it now.
  
      var ret = getEmptyTableSlot();
  
      // Set the new value.
      try {
        // Attempting to call this with JS function will cause of table.set() to fail
        setWasmTableEntry(ret, func);
      } catch (err) {
        if (!(err instanceof TypeError)) {
          throw err;
        }
        var wrapped = convertJsFunctionToWasm(func, sig);
        setWasmTableEntry(ret, wrapped);
      }
  
      functionsInTableMap.set(func, ret);
  
      return ret;
    };

  
  
  
  
  var removeFunction = (index) => {
      functionsInTableMap.delete(getWasmTableEntry(index));
      setWasmTableEntry(index, null);
      freeTableIndexes.push(index);
    };






  var FS_unlink = (path) => FS.unlink(path);
PThread.init();;

  var FSNode = /** @constructor */ function(parent, name, mode, rdev) {
    if (!parent) {
      parent = this;  // root node sets parent to itself
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
  };
  var readMode = 292/*292*/ | 73/*73*/;
  var writeMode = 146/*146*/;
  Object.defineProperties(FSNode.prototype, {
   read: {
    get: /** @this{FSNode} */function() {
     return (this.mode & readMode) === readMode;
    },
    set: /** @this{FSNode} */function(val) {
     val ? this.mode |= readMode : this.mode &= ~readMode;
    }
   },
   write: {
    get: /** @this{FSNode} */function() {
     return (this.mode & writeMode) === writeMode;
    },
    set: /** @this{FSNode} */function(val) {
     val ? this.mode |= writeMode : this.mode &= ~writeMode;
    }
   },
   isFolder: {
    get: /** @this{FSNode} */function() {
     return FS.isDir(this.mode);
    }
   },
   isDevice: {
    get: /** @this{FSNode} */function() {
     return FS.isChrdev(this.mode);
    }
   }
  });
  FS.FSNode = FSNode;
  FS.createPreloadedFile = FS_createPreloadedFile;
  FS.staticInit();Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_unlink"] = FS.unlink;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createDevice"] = FS.createDevice;;

// proxiedFunctionTable specifies the list of functions that can be called
// either synchronously or asynchronously from other threads in postMessage()d
// or internally queued events. This way a pthread in a Worker can synchronously
// access e.g. the DOM on the main thread.
var proxiedFunctionTable = [
  _proc_exit,
  exitOnMainThread,
  pthreadCreateProxied,
  ___syscall_accept4,
  ___syscall_bind,
  ___syscall_chdir,
  ___syscall_connect,
  ___syscall_dup3,
  ___syscall_faccessat,
  ___syscall_fallocate,
  ___syscall_fcntl64,
  ___syscall_fstat64,
  ___syscall_ftruncate64,
  ___syscall_getcwd,
  ___syscall_getdents64,
  ___syscall_getpeername,
  ___syscall_getsockname,
  ___syscall_getsockopt,
  ___syscall_ioctl,
  ___syscall_listen,
  ___syscall_lstat64,
  ___syscall_mkdirat,
  ___syscall_newfstatat,
  ___syscall_openat,
  ___syscall_pipe,
  xterm_pty_old_poll,
  PTY_waitForReadableWithAtomicImpl,
  ___syscall_readlinkat,
  ___syscall_recvfrom,
  ___syscall_recvmsg,
  ___syscall_renameat,
  ___syscall_rmdir,
  ___syscall_sendmsg,
  ___syscall_sendto,
  ___syscall_socket,
  ___syscall_stat64,
  ___syscall_statfs64,
  ___syscall_unlinkat,
  __emscripten_runtime_keepalive_clear,
  __mmap_js,
  __msync_js,
  __munmap_js,
  _environ_get,
  _environ_sizes_get,
  _fd_close,
  _fd_fdstat_get,
  _fd_pread,
  _fd_pwrite,
  xterm_pty_old_fd_read,
  _fd_seek,
  _fd_sync,
  _fd_write,
  _getaddrinfo,
  _gethostbyname
];

var wasmImports = {
  /** @export */
  __assert_fail: ___assert_fail,
  /** @export */
  __call_sighandler: ___call_sighandler,
  /** @export */
  __emscripten_init_main_thread_js: ___emscripten_init_main_thread_js,
  /** @export */
  __emscripten_thread_cleanup: ___emscripten_thread_cleanup,
  /** @export */
  __pthread_create_js: ___pthread_create_js,
  /** @export */
  __pthread_kill_js: ___pthread_kill_js,
  /** @export */
  __syscall_accept4: ___syscall_accept4,
  /** @export */
  __syscall_bind: ___syscall_bind,
  /** @export */
  __syscall_chdir: ___syscall_chdir,
  /** @export */
  __syscall_connect: ___syscall_connect,
  /** @export */
  __syscall_dup3: ___syscall_dup3,
  /** @export */
  __syscall_faccessat: ___syscall_faccessat,
  /** @export */
  __syscall_fallocate: ___syscall_fallocate,
  /** @export */
  __syscall_fcntl64: ___syscall_fcntl64,
  /** @export */
  __syscall_fstat64: ___syscall_fstat64,
  /** @export */
  __syscall_ftruncate64: ___syscall_ftruncate64,
  /** @export */
  __syscall_getcwd: ___syscall_getcwd,
  /** @export */
  __syscall_getdents64: ___syscall_getdents64,
  /** @export */
  __syscall_getpeername: ___syscall_getpeername,
  /** @export */
  __syscall_getsockname: ___syscall_getsockname,
  /** @export */
  __syscall_getsockopt: ___syscall_getsockopt,
  /** @export */
  __syscall_ioctl: ___syscall_ioctl,
  /** @export */
  __syscall_listen: ___syscall_listen,
  /** @export */
  __syscall_lstat64: ___syscall_lstat64,
  /** @export */
  __syscall_mkdirat: ___syscall_mkdirat,
  /** @export */
  __syscall_newfstatat: ___syscall_newfstatat,
  /** @export */
  __syscall_openat: ___syscall_openat,
  /** @export */
  __syscall_pipe: ___syscall_pipe,
  /** @export */
  __syscall_poll: ___syscall_poll,
  /** @export */
  __syscall_readlinkat: ___syscall_readlinkat,
  /** @export */
  __syscall_recvfrom: ___syscall_recvfrom,
  /** @export */
  __syscall_recvmsg: ___syscall_recvmsg,
  /** @export */
  __syscall_renameat: ___syscall_renameat,
  /** @export */
  __syscall_rmdir: ___syscall_rmdir,
  /** @export */
  __syscall_sendmsg: ___syscall_sendmsg,
  /** @export */
  __syscall_sendto: ___syscall_sendto,
  /** @export */
  __syscall_socket: ___syscall_socket,
  /** @export */
  __syscall_stat64: ___syscall_stat64,
  /** @export */
  __syscall_statfs64: ___syscall_statfs64,
  /** @export */
  __syscall_unlinkat: ___syscall_unlinkat,
  /** @export */
  _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
  /** @export */
  _emscripten_notify_mailbox_postmessage: __emscripten_notify_mailbox_postmessage,
  /** @export */
  _emscripten_receive_on_main_thread_js: __emscripten_receive_on_main_thread_js,
  /** @export */
  _emscripten_runtime_keepalive_clear: __emscripten_runtime_keepalive_clear,
  /** @export */
  _emscripten_thread_mailbox_await: __emscripten_thread_mailbox_await,
  /** @export */
  _emscripten_thread_set_strongref: __emscripten_thread_set_strongref,
  /** @export */
  _emscripten_throw_longjmp: __emscripten_throw_longjmp,
  /** @export */
  _gmtime_js: __gmtime_js,
  /** @export */
  _localtime_js: __localtime_js,
  /** @export */
  _mktime_js: __mktime_js,
  /** @export */
  _mmap_js: __mmap_js,
  /** @export */
  _msync_js: __msync_js,
  /** @export */
  _munmap_js: __munmap_js,
  /** @export */
  _tzset_js: __tzset_js,
  /** @export */
  abort: _abort,
  /** @export */
  emscripten_check_blocking_allowed: _emscripten_check_blocking_allowed,
  /** @export */
  emscripten_console_error: _emscripten_console_error,
  /** @export */
  emscripten_date_now: _emscripten_date_now,
  /** @export */
  emscripten_exit_with_live_runtime: _emscripten_exit_with_live_runtime,
  /** @export */
  emscripten_fiber_swap: _emscripten_fiber_swap,
  /** @export */
  emscripten_get_heap_max: _emscripten_get_heap_max,
  /** @export */
  emscripten_get_now: _emscripten_get_now,
  /** @export */
  emscripten_num_logical_cores: _emscripten_num_logical_cores,
  /** @export */
  emscripten_resize_heap: _emscripten_resize_heap,
  /** @export */
  emscripten_runtime_keepalive_check: _emscripten_runtime_keepalive_check,
  /** @export */
  environ_get: _environ_get,
  /** @export */
  environ_sizes_get: _environ_sizes_get,
  /** @export */
  exit: _exit,
  /** @export */
  fd_close: _fd_close,
  /** @export */
  fd_fdstat_get: _fd_fdstat_get,
  /** @export */
  fd_pread: _fd_pread,
  /** @export */
  fd_pwrite: _fd_pwrite,
  /** @export */
  fd_read: _fd_read,
  /** @export */
  fd_seek: _fd_seek,
  /** @export */
  fd_sync: _fd_sync,
  /** @export */
  fd_write: _fd_write,
  /** @export */
  ffi_call_js: ffi_call_js,
  /** @export */
  getaddrinfo: _getaddrinfo,
  /** @export */
  getentropy: _getentropy,
  /** @export */
  gethostbyname: _gethostbyname,
  /** @export */
  getnameinfo: _getnameinfo,
  /** @export */
  init_wasm32_js: init_wasm32_js,
  /** @export */
  instantiate_wasm: instantiate_wasm,
  /** @export */
  invoke_i: invoke_i,
  /** @export */
  invoke_ii: invoke_ii,
  /** @export */
  invoke_iii: invoke_iii,
  /** @export */
  invoke_iiii: invoke_iiii,
  /** @export */
  invoke_iiiiii: invoke_iiiiii,
  /** @export */
  invoke_iiij: invoke_iiij,
  /** @export */
  invoke_iijjii: invoke_iijjii,
  /** @export */
  invoke_ji: invoke_ji,
  /** @export */
  invoke_v: invoke_v,
  /** @export */
  invoke_vi: invoke_vi,
  /** @export */
  invoke_vii: invoke_vii,
  /** @export */
  invoke_viii: invoke_viii,
  /** @export */
  invoke_viiii: invoke_viiii,
  /** @export */
  invoke_viiiji: invoke_viiiji,
  /** @export */
  memory: wasmMemory || Module['wasmMemory'],
  /** @export */
  proc_exit: _proc_exit,
  /** @export */
  strftime: _strftime,
  /** @export */
  system: _system
};
var wasmExports = createWasm();
var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports['__wasm_call_ctors'])();
var _ntohs = (a0) => (_ntohs = wasmExports['ntohs'])(a0);
var _htonl = (a0) => (_htonl = wasmExports['htonl'])(a0);
var _htons = (a0) => (_htons = wasmExports['htons'])(a0);
var ___errno_location = () => (___errno_location = wasmExports['__errno_location'])();
var _free = (a0) => (_free = wasmExports['free'])(a0);
var _malloc = (a0) => (_malloc = wasmExports['malloc'])(a0);
var getTempRet0 = () => (getTempRet0 = wasmExports['getTempRet0'])();
var setTempRet0 = (a0) => (setTempRet0 = wasmExports['setTempRet0'])(a0);
var _main = Module['_main'] = (a0, a1) => (_main = Module['_main'] = wasmExports['__main_argc_argv'])(a0, a1);
var _raise = (a0) => (_raise = wasmExports['raise'])(a0);
var _pthread_self = Module['_pthread_self'] = () => (_pthread_self = Module['_pthread_self'] = wasmExports['pthread_self'])();
var _realloc = Module['_realloc'] = (a0, a1) => (_realloc = Module['_realloc'] = wasmExports['realloc'])(a0, a1);
var _calloc = Module['_calloc'] = (a0, a1) => (_calloc = Module['_calloc'] = wasmExports['calloc'])(a0, a1);
var _emscripten_builtin_free = Module['_emscripten_builtin_free'] = (a0) => (_emscripten_builtin_free = Module['_emscripten_builtin_free'] = wasmExports['emscripten_builtin_free'])(a0);
var __emscripten_tls_init = Module['__emscripten_tls_init'] = () => (__emscripten_tls_init = Module['__emscripten_tls_init'] = wasmExports['_emscripten_tls_init'])();
var _emscripten_builtin_memalign = (a0, a1) => (_emscripten_builtin_memalign = wasmExports['emscripten_builtin_memalign'])(a0, a1);
var __emscripten_proxy_main = Module['__emscripten_proxy_main'] = (a0, a1) => (__emscripten_proxy_main = Module['__emscripten_proxy_main'] = wasmExports['_emscripten_proxy_main'])(a0, a1);
var _emscripten_builtin_malloc = Module['_emscripten_builtin_malloc'] = (a0) => (_emscripten_builtin_malloc = Module['_emscripten_builtin_malloc'] = wasmExports['emscripten_builtin_malloc'])(a0);
var ___libc_calloc = Module['___libc_calloc'] = (a0, a1) => (___libc_calloc = Module['___libc_calloc'] = wasmExports['__libc_calloc'])(a0, a1);
var ___libc_free = Module['___libc_free'] = (a0) => (___libc_free = Module['___libc_free'] = wasmExports['__libc_free'])(a0);
var ___libc_malloc = Module['___libc_malloc'] = (a0) => (___libc_malloc = Module['___libc_malloc'] = wasmExports['__libc_malloc'])(a0);
var __emscripten_thread_init = Module['__emscripten_thread_init'] = (a0, a1, a2, a3, a4, a5) => (__emscripten_thread_init = Module['__emscripten_thread_init'] = wasmExports['_emscripten_thread_init'])(a0, a1, a2, a3, a4, a5);
var __emscripten_thread_crashed = Module['__emscripten_thread_crashed'] = () => (__emscripten_thread_crashed = Module['__emscripten_thread_crashed'] = wasmExports['_emscripten_thread_crashed'])();
var _emscripten_main_thread_process_queued_calls = () => (_emscripten_main_thread_process_queued_calls = wasmExports['emscripten_main_thread_process_queued_calls'])();
var _emscripten_main_runtime_thread_id = () => (_emscripten_main_runtime_thread_id = wasmExports['emscripten_main_runtime_thread_id'])();
var __emscripten_run_on_main_thread_js = (a0, a1, a2, a3) => (__emscripten_run_on_main_thread_js = wasmExports['_emscripten_run_on_main_thread_js'])(a0, a1, a2, a3);
var __emscripten_thread_free_data = (a0) => (__emscripten_thread_free_data = wasmExports['_emscripten_thread_free_data'])(a0);
var __emscripten_thread_exit = Module['__emscripten_thread_exit'] = (a0) => (__emscripten_thread_exit = Module['__emscripten_thread_exit'] = wasmExports['_emscripten_thread_exit'])(a0);
var __emscripten_check_mailbox = () => (__emscripten_check_mailbox = wasmExports['_emscripten_check_mailbox'])();
var __ZdaPv = Module['__ZdaPv'] = (a0) => (__ZdaPv = Module['__ZdaPv'] = wasmExports['_ZdaPv'])(a0);
var __ZdaPvm = Module['__ZdaPvm'] = (a0, a1) => (__ZdaPvm = Module['__ZdaPvm'] = wasmExports['_ZdaPvm'])(a0, a1);
var __ZdlPv = Module['__ZdlPv'] = (a0) => (__ZdlPv = Module['__ZdlPv'] = wasmExports['_ZdlPv'])(a0);
var __ZdlPvm = Module['__ZdlPvm'] = (a0, a1) => (__ZdlPvm = Module['__ZdlPvm'] = wasmExports['_ZdlPvm'])(a0, a1);
var __Znaj = Module['__Znaj'] = (a0) => (__Znaj = Module['__Znaj'] = wasmExports['_Znaj'])(a0);
var __ZnajSt11align_val_t = Module['__ZnajSt11align_val_t'] = (a0, a1) => (__ZnajSt11align_val_t = Module['__ZnajSt11align_val_t'] = wasmExports['_ZnajSt11align_val_t'])(a0, a1);
var __Znwj = Module['__Znwj'] = (a0) => (__Znwj = Module['__Znwj'] = wasmExports['_Znwj'])(a0);
var __ZnwjSt11align_val_t = Module['__ZnwjSt11align_val_t'] = (a0, a1) => (__ZnwjSt11align_val_t = Module['__ZnwjSt11align_val_t'] = wasmExports['_ZnwjSt11align_val_t'])(a0, a1);
var ___libc_realloc = Module['___libc_realloc'] = (a0, a1) => (___libc_realloc = Module['___libc_realloc'] = wasmExports['__libc_realloc'])(a0, a1);
var _malloc_size = Module['_malloc_size'] = (a0) => (_malloc_size = Module['_malloc_size'] = wasmExports['malloc_size'])(a0);
var _malloc_usable_size = Module['_malloc_usable_size'] = (a0) => (_malloc_usable_size = Module['_malloc_usable_size'] = wasmExports['malloc_usable_size'])(a0);
var _reallocf = Module['_reallocf'] = (a0, a1) => (_reallocf = Module['_reallocf'] = wasmExports['reallocf'])(a0, a1);
var _setThrew = (a0, a1) => (_setThrew = wasmExports['setThrew'])(a0, a1);
var _emscripten_stack_set_limits = (a0, a1) => (_emscripten_stack_set_limits = wasmExports['emscripten_stack_set_limits'])(a0, a1);
var stackSave = () => (stackSave = wasmExports['stackSave'])();
var stackRestore = (a0) => (stackRestore = wasmExports['stackRestore'])(a0);
var stackAlloc = (a0) => (stackAlloc = wasmExports['stackAlloc'])(a0);
var dynCall_v = Module['dynCall_v'] = (a0) => (dynCall_v = Module['dynCall_v'] = wasmExports['dynCall_v'])(a0);
var dynCall_ji = Module['dynCall_ji'] = (a0, a1) => (dynCall_ji = Module['dynCall_ji'] = wasmExports['dynCall_ji'])(a0, a1);
var dynCall_viii = Module['dynCall_viii'] = (a0, a1, a2, a3) => (dynCall_viii = Module['dynCall_viii'] = wasmExports['dynCall_viii'])(a0, a1, a2, a3);
var dynCall_iiii = Module['dynCall_iiii'] = (a0, a1, a2, a3) => (dynCall_iiii = Module['dynCall_iiii'] = wasmExports['dynCall_iiii'])(a0, a1, a2, a3);
var dynCall_ii = Module['dynCall_ii'] = (a0, a1) => (dynCall_ii = Module['dynCall_ii'] = wasmExports['dynCall_ii'])(a0, a1);
var dynCall_vi = Module['dynCall_vi'] = (a0, a1) => (dynCall_vi = Module['dynCall_vi'] = wasmExports['dynCall_vi'])(a0, a1);
var dynCall_vii = Module['dynCall_vii'] = (a0, a1, a2) => (dynCall_vii = Module['dynCall_vii'] = wasmExports['dynCall_vii'])(a0, a1, a2);
var dynCall_iji = Module['dynCall_iji'] = (a0, a1, a2) => (dynCall_iji = Module['dynCall_iji'] = wasmExports['dynCall_iji'])(a0, a1, a2);
var dynCall_viji = Module['dynCall_viji'] = (a0, a1, a2, a3) => (dynCall_viji = Module['dynCall_viji'] = wasmExports['dynCall_viji'])(a0, a1, a2, a3);
var dynCall_vji = Module['dynCall_vji'] = (a0, a1, a2) => (dynCall_vji = Module['dynCall_vji'] = wasmExports['dynCall_vji'])(a0, a1, a2);
var dynCall_ijiii = Module['dynCall_ijiii'] = (a0, a1, a2, a3, a4) => (dynCall_ijiii = Module['dynCall_ijiii'] = wasmExports['dynCall_ijiii'])(a0, a1, a2, a3, a4);
var dynCall_iii = Module['dynCall_iii'] = (a0, a1, a2) => (dynCall_iii = Module['dynCall_iii'] = wasmExports['dynCall_iii'])(a0, a1, a2);
var dynCall_viiii = Module['dynCall_viiii'] = (a0, a1, a2, a3, a4) => (dynCall_viiii = Module['dynCall_viiii'] = wasmExports['dynCall_viiii'])(a0, a1, a2, a3, a4);
var dynCall_viiiii = Module['dynCall_viiiii'] = (a0, a1, a2, a3, a4, a5) => (dynCall_viiiii = Module['dynCall_viiiii'] = wasmExports['dynCall_viiiii'])(a0, a1, a2, a3, a4, a5);
var dynCall_iiiii = Module['dynCall_iiiii'] = (a0, a1, a2, a3, a4) => (dynCall_iiiii = Module['dynCall_iiiii'] = wasmExports['dynCall_iiiii'])(a0, a1, a2, a3, a4);
var dynCall_ij = Module['dynCall_ij'] = (a0, a1) => (dynCall_ij = Module['dynCall_ij'] = wasmExports['dynCall_ij'])(a0, a1);
var dynCall_jiji = Module['dynCall_jiji'] = (a0, a1, a2, a3) => (dynCall_jiji = Module['dynCall_jiji'] = wasmExports['dynCall_jiji'])(a0, a1, a2, a3);
var dynCall_vijji = Module['dynCall_vijji'] = (a0, a1, a2, a3, a4) => (dynCall_vijji = Module['dynCall_vijji'] = wasmExports['dynCall_vijji'])(a0, a1, a2, a3, a4);
var dynCall_iiiiii = Module['dynCall_iiiiii'] = (a0, a1, a2, a3, a4, a5) => (dynCall_iiiiii = Module['dynCall_iiiiii'] = wasmExports['dynCall_iiiiii'])(a0, a1, a2, a3, a4, a5);
var dynCall_iijiii = Module['dynCall_iijiii'] = (a0, a1, a2, a3, a4, a5) => (dynCall_iijiii = Module['dynCall_iijiii'] = wasmExports['dynCall_iijiii'])(a0, a1, a2, a3, a4, a5);
var dynCall_iijjii = Module['dynCall_iijjii'] = (a0, a1, a2, a3, a4, a5) => (dynCall_iijjii = Module['dynCall_iijjii'] = wasmExports['dynCall_iijjii'])(a0, a1, a2, a3, a4, a5);
var dynCall_iij = Module['dynCall_iij'] = (a0, a1, a2) => (dynCall_iij = Module['dynCall_iij'] = wasmExports['dynCall_iij'])(a0, a1, a2);
var dynCall_iiiiji = Module['dynCall_iiiiji'] = (a0, a1, a2, a3, a4, a5) => (dynCall_iiiiji = Module['dynCall_iiiiji'] = wasmExports['dynCall_iiiiji'])(a0, a1, a2, a3, a4, a5);
var dynCall_iiiiiii = Module['dynCall_iiiiiii'] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_iiiiiii = Module['dynCall_iiiiiii'] = wasmExports['dynCall_iiiiiii'])(a0, a1, a2, a3, a4, a5, a6);
var dynCall_viiiiiii = Module['dynCall_viiiiiii'] = (a0, a1, a2, a3, a4, a5, a6, a7) => (dynCall_viiiiiii = Module['dynCall_viiiiiii'] = wasmExports['dynCall_viiiiiii'])(a0, a1, a2, a3, a4, a5, a6, a7);
var dynCall_vijii = Module['dynCall_vijii'] = (a0, a1, a2, a3, a4) => (dynCall_vijii = Module['dynCall_vijii'] = wasmExports['dynCall_vijii'])(a0, a1, a2, a3, a4);
var dynCall_jij = Module['dynCall_jij'] = (a0, a1, a2) => (dynCall_jij = Module['dynCall_jij'] = wasmExports['dynCall_jij'])(a0, a1, a2);
var dynCall_vij = Module['dynCall_vij'] = (a0, a1, a2) => (dynCall_vij = Module['dynCall_vij'] = wasmExports['dynCall_vij'])(a0, a1, a2);
var dynCall_iiji = Module['dynCall_iiji'] = (a0, a1, a2, a3) => (dynCall_iiji = Module['dynCall_iiji'] = wasmExports['dynCall_iiji'])(a0, a1, a2, a3);
var dynCall_ijiiii = Module['dynCall_ijiiii'] = (a0, a1, a2, a3, a4, a5) => (dynCall_ijiiii = Module['dynCall_ijiiii'] = wasmExports['dynCall_ijiiii'])(a0, a1, a2, a3, a4, a5);
var dynCall_jii = Module['dynCall_jii'] = (a0, a1, a2) => (dynCall_jii = Module['dynCall_jii'] = wasmExports['dynCall_jii'])(a0, a1, a2);
var dynCall_viijj = Module['dynCall_viijj'] = (a0, a1, a2, a3, a4) => (dynCall_viijj = Module['dynCall_viijj'] = wasmExports['dynCall_viijj'])(a0, a1, a2, a3, a4);
var dynCall_jiijj = Module['dynCall_jiijj'] = (a0, a1, a2, a3, a4) => (dynCall_jiijj = Module['dynCall_jiijj'] = wasmExports['dynCall_jiijj'])(a0, a1, a2, a3, a4);
var dynCall_viijii = Module['dynCall_viijii'] = (a0, a1, a2, a3, a4, a5) => (dynCall_viijii = Module['dynCall_viijii'] = wasmExports['dynCall_viijii'])(a0, a1, a2, a3, a4, a5);
var dynCall_vijiii = Module['dynCall_vijiii'] = (a0, a1, a2, a3, a4, a5) => (dynCall_vijiii = Module['dynCall_vijiii'] = wasmExports['dynCall_vijiii'])(a0, a1, a2, a3, a4, a5);
var dynCall_vijj = Module['dynCall_vijj'] = (a0, a1, a2, a3) => (dynCall_vijj = Module['dynCall_vijj'] = wasmExports['dynCall_vijj'])(a0, a1, a2, a3);
var dynCall_i = Module['dynCall_i'] = (a0) => (dynCall_i = Module['dynCall_i'] = wasmExports['dynCall_i'])(a0);
var dynCall_vjiii = Module['dynCall_vjiii'] = (a0, a1, a2, a3, a4) => (dynCall_vjiii = Module['dynCall_vjiii'] = wasmExports['dynCall_vjiii'])(a0, a1, a2, a3, a4);
var dynCall_jj = Module['dynCall_jj'] = (a0, a1) => (dynCall_jj = Module['dynCall_jj'] = wasmExports['dynCall_jj'])(a0, a1);
var dynCall_viiiijjii = Module['dynCall_viiiijjii'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (dynCall_viiiijjii = Module['dynCall_viiiijjii'] = wasmExports['dynCall_viiiijjii'])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
var dynCall_iijji = Module['dynCall_iijji'] = (a0, a1, a2, a3, a4) => (dynCall_iijji = Module['dynCall_iijji'] = wasmExports['dynCall_iijji'])(a0, a1, a2, a3, a4);
var dynCall_iijj = Module['dynCall_iijj'] = (a0, a1, a2, a3) => (dynCall_iijj = Module['dynCall_iijj'] = wasmExports['dynCall_iijj'])(a0, a1, a2, a3);
var dynCall_jijii = Module['dynCall_jijii'] = (a0, a1, a2, a3, a4) => (dynCall_jijii = Module['dynCall_jijii'] = wasmExports['dynCall_jijii'])(a0, a1, a2, a3, a4);
var dynCall_iiiiiiii = Module['dynCall_iiiiiiii'] = (a0, a1, a2, a3, a4, a5, a6, a7) => (dynCall_iiiiiiii = Module['dynCall_iiiiiiii'] = wasmExports['dynCall_iiiiiiii'])(a0, a1, a2, a3, a4, a5, a6, a7);
var dynCall_viiiiii = Module['dynCall_viiiiii'] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_viiiiii = Module['dynCall_viiiiii'] = wasmExports['dynCall_viiiiii'])(a0, a1, a2, a3, a4, a5, a6);
var dynCall_viiiiiiii = Module['dynCall_viiiiiiii'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (dynCall_viiiiiiii = Module['dynCall_viiiiiiii'] = wasmExports['dynCall_viiiiiiii'])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
var dynCall_viij = Module['dynCall_viij'] = (a0, a1, a2, a3) => (dynCall_viij = Module['dynCall_viij'] = wasmExports['dynCall_viij'])(a0, a1, a2, a3);
var dynCall_iiiijii = Module['dynCall_iiiijii'] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_iiiijii = Module['dynCall_iiiijii'] = wasmExports['dynCall_iiiijii'])(a0, a1, a2, a3, a4, a5, a6);
var dynCall_iiiij = Module['dynCall_iiiij'] = (a0, a1, a2, a3, a4) => (dynCall_iiiij = Module['dynCall_iiiij'] = wasmExports['dynCall_iiiij'])(a0, a1, a2, a3, a4);
var dynCall_iijiiiii = Module['dynCall_iijiiiii'] = (a0, a1, a2, a3, a4, a5, a6, a7) => (dynCall_iijiiiii = Module['dynCall_iijiiiii'] = wasmExports['dynCall_iijiiiii'])(a0, a1, a2, a3, a4, a5, a6, a7);
var dynCall_vijjiiiiii = Module['dynCall_vijjiiiiii'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (dynCall_vijjiiiiii = Module['dynCall_vijjiiiiii'] = wasmExports['dynCall_vijjiiiiii'])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
var dynCall_jjji = Module['dynCall_jjji'] = (a0, a1, a2, a3) => (dynCall_jjji = Module['dynCall_jjji'] = wasmExports['dynCall_jjji'])(a0, a1, a2, a3);
var dynCall_jji = Module['dynCall_jji'] = (a0, a1, a2) => (dynCall_jji = Module['dynCall_jji'] = wasmExports['dynCall_jji'])(a0, a1, a2);
var dynCall_vjji = Module['dynCall_vjji'] = (a0, a1, a2, a3) => (dynCall_vjji = Module['dynCall_vjji'] = wasmExports['dynCall_vjji'])(a0, a1, a2, a3);
var dynCall_jjii = Module['dynCall_jjii'] = (a0, a1, a2, a3) => (dynCall_jjii = Module['dynCall_jjii'] = wasmExports['dynCall_jjii'])(a0, a1, a2, a3);
var dynCall_jiii = Module['dynCall_jiii'] = (a0, a1, a2, a3) => (dynCall_jiii = Module['dynCall_jiii'] = wasmExports['dynCall_jiii'])(a0, a1, a2, a3);
var dynCall_ijii = Module['dynCall_ijii'] = (a0, a1, a2, a3) => (dynCall_ijii = Module['dynCall_ijii'] = wasmExports['dynCall_ijii'])(a0, a1, a2, a3);
var dynCall_jjjji = Module['dynCall_jjjji'] = (a0, a1, a2, a3, a4) => (dynCall_jjjji = Module['dynCall_jjjji'] = wasmExports['dynCall_jjjji'])(a0, a1, a2, a3, a4);
var dynCall_jijj = Module['dynCall_jijj'] = (a0, a1, a2, a3) => (dynCall_jijj = Module['dynCall_jijj'] = wasmExports['dynCall_jijj'])(a0, a1, a2, a3);
var dynCall_jjj = Module['dynCall_jjj'] = (a0, a1, a2) => (dynCall_jjj = Module['dynCall_jjj'] = wasmExports['dynCall_jjj'])(a0, a1, a2);
var dynCall_jjiii = Module['dynCall_jjiii'] = (a0, a1, a2, a3, a4) => (dynCall_jjiii = Module['dynCall_jjiii'] = wasmExports['dynCall_jjiii'])(a0, a1, a2, a3, a4);
var dynCall_jiij = Module['dynCall_jiij'] = (a0, a1, a2, a3) => (dynCall_jiij = Module['dynCall_jiij'] = wasmExports['dynCall_jiij'])(a0, a1, a2, a3);
var dynCall_ijj = Module['dynCall_ijj'] = (a0, a1, a2) => (dynCall_ijj = Module['dynCall_ijj'] = wasmExports['dynCall_ijj'])(a0, a1, a2);
var dynCall_viiji = Module['dynCall_viiji'] = (a0, a1, a2, a3, a4) => (dynCall_viiji = Module['dynCall_viiji'] = wasmExports['dynCall_viiji'])(a0, a1, a2, a3, a4);
var dynCall_viiiji = Module['dynCall_viiiji'] = (a0, a1, a2, a3, a4, a5) => (dynCall_viiiji = Module['dynCall_viiiji'] = wasmExports['dynCall_viiiji'])(a0, a1, a2, a3, a4, a5);
var dynCall_jiiii = Module['dynCall_jiiii'] = (a0, a1, a2, a3, a4) => (dynCall_jiiii = Module['dynCall_jiiii'] = wasmExports['dynCall_jiiii'])(a0, a1, a2, a3, a4);
var dynCall_jjiiii = Module['dynCall_jjiiii'] = (a0, a1, a2, a3, a4, a5) => (dynCall_jjiiii = Module['dynCall_jjiiii'] = wasmExports['dynCall_jjiiii'])(a0, a1, a2, a3, a4, a5);
var dynCall_viiijii = Module['dynCall_viiijii'] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_viiijii = Module['dynCall_viiijii'] = wasmExports['dynCall_viiijii'])(a0, a1, a2, a3, a4, a5, a6);
var dynCall_viiiiji = Module['dynCall_viiiiji'] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_viiiiji = Module['dynCall_viiiiji'] = wasmExports['dynCall_viiiiji'])(a0, a1, a2, a3, a4, a5, a6);
var dynCall_jiiij = Module['dynCall_jiiij'] = (a0, a1, a2, a3, a4) => (dynCall_jiiij = Module['dynCall_jiiij'] = wasmExports['dynCall_jiiij'])(a0, a1, a2, a3, a4);
var dynCall_viiij = Module['dynCall_viiij'] = (a0, a1, a2, a3, a4) => (dynCall_viiij = Module['dynCall_viiij'] = wasmExports['dynCall_viiij'])(a0, a1, a2, a3, a4);
var dynCall_viiiij = Module['dynCall_viiiij'] = (a0, a1, a2, a3, a4, a5) => (dynCall_viiiij = Module['dynCall_viiiij'] = wasmExports['dynCall_viiiij'])(a0, a1, a2, a3, a4, a5);
var dynCall_jijjiiii = Module['dynCall_jijjiiii'] = (a0, a1, a2, a3, a4, a5, a6, a7) => (dynCall_jijjiiii = Module['dynCall_jijjiiii'] = wasmExports['dynCall_jijjiiii'])(a0, a1, a2, a3, a4, a5, a6, a7);
var dynCall_iijiiiji = Module['dynCall_iijiiiji'] = (a0, a1, a2, a3, a4, a5, a6, a7) => (dynCall_iijiiiji = Module['dynCall_iijiiiji'] = wasmExports['dynCall_iijiiiji'])(a0, a1, a2, a3, a4, a5, a6, a7);
var dynCall_jijjji = Module['dynCall_jijjji'] = (a0, a1, a2, a3, a4, a5) => (dynCall_jijjji = Module['dynCall_jijjji'] = wasmExports['dynCall_jijjji'])(a0, a1, a2, a3, a4, a5);
var dynCall_iijii = Module['dynCall_iijii'] = (a0, a1, a2, a3, a4) => (dynCall_iijii = Module['dynCall_iijii'] = wasmExports['dynCall_iijii'])(a0, a1, a2, a3, a4);
var dynCall_jijji = Module['dynCall_jijji'] = (a0, a1, a2, a3, a4) => (dynCall_jijji = Module['dynCall_jijji'] = wasmExports['dynCall_jijji'])(a0, a1, a2, a3, a4);
var dynCall_iiij = Module['dynCall_iiij'] = (a0, a1, a2, a3) => (dynCall_iiij = Module['dynCall_iiij'] = wasmExports['dynCall_iiij'])(a0, a1, a2, a3);
var dynCall_j = Module['dynCall_j'] = (a0) => (dynCall_j = Module['dynCall_j'] = wasmExports['dynCall_j'])(a0);
var dynCall_iiijj = Module['dynCall_iiijj'] = (a0, a1, a2, a3, a4) => (dynCall_iiijj = Module['dynCall_iiijj'] = wasmExports['dynCall_iiijj'])(a0, a1, a2, a3, a4);
var dynCall_iiiiiiiii = Module['dynCall_iiiiiiiii'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (dynCall_iiiiiiiii = Module['dynCall_iiiiiiiii'] = wasmExports['dynCall_iiiiiiiii'])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
var dynCall_iiijjiii = Module['dynCall_iiijjiii'] = (a0, a1, a2, a3, a4, a5, a6, a7) => (dynCall_iiijjiii = Module['dynCall_iiijjiii'] = wasmExports['dynCall_iiijjiii'])(a0, a1, a2, a3, a4, a5, a6, a7);
var dynCall_iijjiii = Module['dynCall_iijjiii'] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_iijjiii = Module['dynCall_iijjiii'] = wasmExports['dynCall_iijjiii'])(a0, a1, a2, a3, a4, a5, a6);
var dynCall_iijiiii = Module['dynCall_iijiiii'] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_iijiiii = Module['dynCall_iijiiii'] = wasmExports['dynCall_iijiiii'])(a0, a1, a2, a3, a4, a5, a6);
var dynCall_iijjiiii = Module['dynCall_iijjiiii'] = (a0, a1, a2, a3, a4, a5, a6, a7) => (dynCall_iijjiiii = Module['dynCall_iijjiiii'] = wasmExports['dynCall_iijjiiii'])(a0, a1, a2, a3, a4, a5, a6, a7);
var dynCall_iiijijjii = Module['dynCall_iiijijjii'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (dynCall_iiijijjii = Module['dynCall_iiijijjii'] = wasmExports['dynCall_iiijijjii'])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
var dynCall_iiijiiiii = Module['dynCall_iiijiiiii'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (dynCall_iiijiiiii = Module['dynCall_iiijiiiii'] = wasmExports['dynCall_iiijiiiii'])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
var dynCall_vijjii = Module['dynCall_vijjii'] = (a0, a1, a2, a3, a4, a5) => (dynCall_vijjii = Module['dynCall_vijjii'] = wasmExports['dynCall_vijjii'])(a0, a1, a2, a3, a4, a5);
var dynCall_iidiiii = Module['dynCall_iidiiii'] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_iidiiii = Module['dynCall_iidiiii'] = wasmExports['dynCall_iidiiii'])(a0, a1, a2, a3, a4, a5, a6);
var _asyncify_start_unwind = (a0) => (_asyncify_start_unwind = wasmExports['asyncify_start_unwind'])(a0);
var _asyncify_stop_unwind = () => (_asyncify_stop_unwind = wasmExports['asyncify_stop_unwind'])();
var _asyncify_start_rewind = (a0) => (_asyncify_start_rewind = wasmExports['asyncify_start_rewind'])(a0);
var _asyncify_stop_rewind = () => (_asyncify_stop_rewind = wasmExports['asyncify_stop_rewind'])();
var ___start_em_js = Module['___start_em_js'] = 8520616;
var ___stop_em_js = Module['___stop_em_js'] = 8532755;
function invoke_ii(index,a1) {
  var sp = stackSave();
  try {
    return dynCall_ii(index,a1);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_ji(index,a1) {
  var sp = stackSave();
  try {
    return dynCall_ji(index,a1);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
    return 0n;
  }
}

function invoke_v(index) {
  var sp = stackSave();
  try {
    dynCall_v(index);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  var sp = stackSave();
  try {
    dynCall_viiii(index,a1,a2,a3,a4);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iijjii(index,a1,a2,a3,a4,a5) {
  var sp = stackSave();
  try {
    return dynCall_iijjii(index,a1,a2,a3,a4,a5);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  var sp = stackSave();
  try {
    return dynCall_iiiiii(index,a1,a2,a3,a4,a5);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_vi(index,a1) {
  var sp = stackSave();
  try {
    dynCall_vi(index,a1);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  var sp = stackSave();
  try {
    return dynCall_iii(index,a1,a2);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_i(index) {
  var sp = stackSave();
  try {
    return dynCall_i(index);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  var sp = stackSave();
  try {
    dynCall_vii(index,a1,a2);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    return dynCall_iiii(index,a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiji(index,a1,a2,a3,a4,a5) {
  var sp = stackSave();
  try {
    dynCall_viiiji(index,a1,a2,a3,a4,a5);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiij(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    return dynCall_iiij(index,a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    dynCall_viii(index,a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}


// include: postamble.js
// === Auto-generated postamble setup entry stuff ===

Module['addRunDependency'] = addRunDependency;
Module['removeRunDependency'] = removeRunDependency;
Module['FS_createPath'] = FS.createPath;
Module['FS_createLazyFile'] = FS.createLazyFile;
Module['FS_createDevice'] = FS.createDevice;
Module['wasmMemory'] = wasmMemory;
Module['getTempRet0'] = getTempRet0;
Module['setTempRet0'] = setTempRet0;
Module['keepRuntimeAlive'] = keepRuntimeAlive;
Module['addFunction'] = addFunction;
Module['removeFunction'] = removeFunction;
Module['ExitStatus'] = ExitStatus;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_unlink'] = FS.unlink;
Module['TTY'] = TTY;


var calledRun;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function callMain(args = []) {

  var entryFunction = __emscripten_proxy_main;

  // With PROXY_TO_PTHREAD make sure we keep the runtime alive until the
  // proxied main calls exit (see exitOnMainThread() for where Pop is called).
  runtimeKeepalivePush();

  args.unshift(thisProgram);

  var argc = args.length;
  var argv = stackAlloc((argc + 1) * 4);
  var argv_ptr = argv;
  args.forEach((arg) => {
    HEAPU32[((argv_ptr)>>2)] = stringToUTF8OnStack(arg);
    argv_ptr += 4;
  });
  HEAPU32[((argv_ptr)>>2)] = 0;

  try {

    var ret = entryFunction(argc, argv);

    // if we're not running an evented main loop, it's time to exit
    exitJS(ret, /* implicit = */ true);
    return ret;
  }
  catch (e) {
    return handleException(e);
  }
}

function run(args = arguments_) {

  if (runDependencies > 0) {
    return;
  }

  if (ENVIRONMENT_IS_PTHREAD) {
    // The promise resolve function typically gets called as part of the execution
    // of `doRun` below. The workers/pthreads don't execute `doRun` so the
    // creation promise can be resolved, marking the pthread-Module as initialized.
    readyPromiseResolve(Module);
    initRuntime();
    startWorker(Module);
    return;
  }

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    readyPromiseResolve(Module);
    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    if (shouldRunNow) callMain(args);

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;

if (Module['noInitialRun']) shouldRunNow = false;

run();


// end include: postamble.js


  return moduleArg.ready
}
);
})();
;
export default Module;