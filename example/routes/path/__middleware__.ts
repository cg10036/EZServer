import { Request, Response, NextFunction } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
  console.log("__middleware__");
  next();
};
