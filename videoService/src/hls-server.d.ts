import { Server as HTTPServer,  } from 'http';
import { Server as HTTPSServer } from 'https';

declare module 'hls-server' {
  interface HLSOptions {
    provider: {
      exists: (req, cb: (exists, path) => void) => void;
      getManifestStream?: (req, cb: (stream) => void) => void;
      getSegmentStream?: (req, cb: (stream) => void) => void;
    };
  }

  class HLS {
    constructor(server: HTTPServer | HTTPSServer, options: HLSOptions);
  }

  export = HLS;
}
