#import <CoreFoundation/CoreFoundation.h>
#import <dispatch/dispatch.h>

typedef void *NStatManagerRef;
typedef void *NStatSourceRef;

extern CFStringRef kNStatSrcKeyProvider;

NStatManagerRef NStatManagerCreate(const struct __CFAllocator *,
                                   dispatch_queue_t, void (^)(NStatManagerRef));

int NStatManagerSetInterfaceTraceFD(NStatManagerRef, int fd);
int NStatManagerSetFlags(NStatManagerRef, int Flags);
int NStatManagerAddAllTCPWithFilter(NStatManagerRef, int, int);
int NStatManagerAddAllUDPWithFilter(NStatManagerRef, int, int);
void *NStatSourceQueryDescription(NStatSourceRef);
CFStringRef NStatSourceCopyProperty(NStatSourceRef, CFStringRef);
void NStatSourceSetDescriptionBlock(NStatSourceRef, void (^)(CFDictionaryRef));

void (^description_callback_block)(CFDictionaryRef) = ^(CFDictionaryRef Desc) {
  CFShow(Desc);
};

void (^callback_block)(NStatSourceRef arg) = ^(NStatSourceRef arg) {
  const CFStringRef prop = NStatSourceCopyProperty(arg, kNStatSrcKeyProvider);

  NStatSourceSetDescriptionBlock(arg, description_callback_block);
  void *desc = NStatSourceQueryDescription(arg); // Continued in callback
};

int main(int argc, char **argv) {

  NStatManagerRef nm = NStatManagerCreate(kCFAllocatorDefault,
                                          dispatch_get_main_queue(), callback_block);

  int rc = NStatManagerSetFlags(nm, 0);

  // A trace file will show the raw nstat messages
  // int fd = open("/tmp/netbottom.trace", O_RDWR | O_CREAT | O_TRUNC);
  // rc = NStatManagerSetInterfaceTraceFD(nm, fd);

  rc = NStatManagerAddAllTCPWithFilter(nm, 0, 0);
  rc = NStatManagerAddAllUDPWithFilter(nm, 0, 0);

  dispatch_main();
}
