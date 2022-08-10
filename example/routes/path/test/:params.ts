import { Request, Response } from "express";

export default {
  get: (req: Request, res: Response) => {
    res.json(req.params);
  },
};
