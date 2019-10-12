declare type ServerOptions={
     
          cache: boolean,
          timeout: number,
          method:string,// 'GET',
          candel: function
      
}



declare class Server{
     static  controller(controller:string,method:string,params:object,options:ServerOptions):Promise;
     static  dvm():Promise;



}