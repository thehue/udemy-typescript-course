import 'reflect-metadata';
import { AppRouter } from '../../AppRouter';
import { Methods } from './enum/Methods';
import { MetadataKeys } from './enum/MetadataKeys';
import { NextFunction, RequestHandler, Request, Response } from 'express';

function bodyValidators(keys: string): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    if(!req.body){
      res.status(422).send('Invalid request');
      return;
    }

    for(let key of keys) {
      if(!req.body[key]) {
        res.status(422).send('Invalid request');
        return;
      }
    }

    next();
  }
}

export function controller(routePrefix: string){
  return function(target: Function){
    const router = AppRouter.getInstance();

    for(let key in target.prototype){
      const routeHandler = target.prototype[key];
      const path = Reflect.getMetadata(MetadataKeys.path, target.prototype, key);
      const method: Methods = Reflect.getMetadata(MetadataKeys.method, target.prototype, key);
      const middlewares = Reflect.getMetadata(MetadataKeys.middleware, target.prototype, key) || [];
      const requiredBodyProps = Reflect.getMetadata(MetadataKeys.validator, target.prototype, key);

      const validator = bodyValidators(requiredBodyProps);

      if(path){
        // ... spread syntax -> rest parameter
        // 마지막에 validate 해준다.
        router[method](`${routePrefix}${path}`, ...middlewares, validator, routeHandler);
      }
    }
  };
} 