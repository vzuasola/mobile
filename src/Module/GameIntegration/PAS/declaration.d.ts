declare var iapiConf: any;
declare function iapiSetCallout(name: string, callback: any): any;
declare function iapiKeepAlive(id: number, callback: any): any;
declare function iapiGetLoggedInPlayer(id: number): any;
declare function iapiLogout(id: number, pid: number): any;
declare function iapiLogin(username: string, password: string, real: any, language: string): any;
declare function iapiValidateTCVersion(response: any, id: number, pid: number): any;
