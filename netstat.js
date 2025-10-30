function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

const ok = ObjC.classes.NSBundle.bundleWithPath_(
  "/System/Library/PrivateFrameworks/NetworkStatistics.framework",
).load();
console.log(ok);

const framework = Process.findModuleByName("NetworkStatistics");
assert(framework !== null, "NetworkStatistics.framework not found");

const NStatManagerCreatePtr = framework.findExportByName("NStatManagerCreate");
const NStatManagerSetFlagsPtr = framework.findExportByName(
  "NStatManagerSetFlags",
);
const NStatManagerAddAllTCPWithFilterPtr = framework.findExportByName(
  "NStatManagerAddAllTCPWithFilter",
);
const NStatManagerAddAllUDPWithFilterPtr = framework.findExportByName(
  "NStatManagerAddAllUDPWithFilter",
);
const NStatSourceQueryDescriptionPtr = framework.findExportByName(
  "NStatSourceQueryDescription",
);
const NStatSourceCopyPropertyPtr = framework.findExportByName(
  "NStatSourceCopyProperty",
);
const NStatSourceSetDescriptionBlockPtr = framework.findExportByName(
  "NStatSourceSetDescriptionBlock",
);
const kNStatSrcKeyProviderPtr = framework.findExportByName(
  "kNStatSrcKeyProvider",
);

// Typedefs for the C functions
const NStatManagerCreate = new NativeFunction(
  NStatManagerCreatePtr,
  "pointer",
  ["pointer", "pointer", "pointer"],
);
const NStatManagerSetFlags = new NativeFunction(
  NStatManagerSetFlagsPtr,
  "int",
  ["pointer", "int"],
);
const NStatManagerAddAllTCPWithFilter = new NativeFunction(
  NStatManagerAddAllTCPWithFilterPtr,
  "int",
  ["pointer", "int", "int"],
);
const NStatManagerAddAllUDPWithFilter = new NativeFunction(
  NStatManagerAddAllUDPWithFilterPtr,
  "int",
  ["pointer", "int", "int"],
);
const NStatSourceQueryDescription = new NativeFunction(
  NStatSourceQueryDescriptionPtr,
  "pointer",
  ["pointer"],
);
const NStatSourceCopyProperty = new NativeFunction(
  NStatSourceCopyPropertyPtr,
  "pointer",
  ["pointer", "pointer"],
);
const NStatSourceSetDescriptionBlock = new NativeFunction(
  NStatSourceSetDescriptionBlockPtr,
  "void",
  ["pointer", "pointer"],
);

const kNStatSrcKeyProvider = kNStatSrcKeyProviderPtr.readPointer();
const dispatch_main_q_ptr = Module.findGlobalExportByName("_dispatch_main_q");
const kCFAllocatorDefault = Module.findGlobalExportByName(
  "kCFAllocatorDefault",
);

// Signature: void (^)(CFDictionaryRef)
const description_callback_block = new ObjC.Block({
  retType: "void",
  argTypes: ["pointer"],
  implementation: function (desc) {
    console.log(new ObjC.Object(desc).toString());
  },
});

const callback_block = new ObjC.Block({
  retType: "void",
  argTypes: ["pointer"],
  implementation: function (arg) {
    const propRef = NStatSourceCopyProperty(arg, kNStatSrcKeyProvider);
    if (propRef) {
      console.log(new ObjC.Object(propRef).toString());
    }

    NStatSourceSetDescriptionBlock(arg, description_callback_block);
    NStatSourceQueryDescription(arg);
  },
});

console.log("[*] Starting NStatManager setup...");

const nm = NStatManagerCreate(
  kCFAllocatorDefault,
  dispatch_main_q_ptr,
  callback_block,
);

if (nm.isNull()) {
  console.error("[-] NStatManagerCreate failed! Ref is NULL.");
  throw new Error("NStatManager setup failed.");
}

console.log("[+] NStatManagerRef created: " + nm);

let rc = NStatManagerSetFlags(nm, 0);
console.log(`[+] NStatManagerSetFlags returned: ${rc}`);

rc = NStatManagerAddAllTCPWithFilter(nm, 0, 0);
console.log(`[+] NStatManagerAddAllTCPWithFilter returned: ${rc}`);

rc = NStatManagerAddAllUDPWithFilter(nm, 0, 0);
console.log(`[+] NStatManagerAddAllUDPWithFilter returned: ${rc}`);
