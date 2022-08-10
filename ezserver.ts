import {
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import path from "path";
import fs from "fs/promises";

const setRoute = (
  app: Express,
  path: string,
  data: {
    get?: (handlers: RequestHandler) => {};
    post?: (handlers: RequestHandler) => {};
    patch?: (handlers: RequestHandler) => {};
    delete?: (handlers: RequestHandler) => {};
  }
) => {
  console.log({ path, data });
  Object.keys(data).forEach((e) => {
    (app as any)[e](path, (req: Request, res: Response, next: NextFunction) => {
      try {
        let tmp = (data as any)[e](req, res, next);
        if (tmp && tmp.catch) {
          tmp.catch(next);
        }
      } catch (err) {
        next(err);
      }
    });
  });
};

const searchRoutes = async (
  app: Express,
  routesDir = "./routes",
  currDir = ""
) => {
  if (!currDir) {
    routesDir = path.normalize(routesDir);
    currDir = routesDir;
  }

  let p = currDir.slice(routesDir.length);
  if (!p) {
    p = "/" + p;
  }
  console.log(p);

  const dirs = await fs.readdir(currDir);
  dirs.sort((a, b) => {
    if (a[0] === ":") {
      return -1;
    } else if (b[0] === ":") {
      return -1;
    }
    return 1;
  });

  for (let i = 0; i < dirs.length; i++) {
    const filename = dirs[i];
    const filepath = path.join(currDir, filename);

    const stat = await fs.stat(filepath);
    if (stat.isFile()) {
      if (filename.endsWith(".js") || filename.endsWith(".ts")) {
        const { name } = path.parse(filename);
        const { default: tmp } = await import(path.resolve(filepath));

        if (name === "__index__") {
          setRoute(app, p, tmp);
        } else if (name === "__middleware__" || name === "__middle__") {
          app.use(tmp);
        } else {
          setRoute(app, p + (p == "/" ? "" : "/") + name, tmp);
        }
      }
    } else if (stat.isDirectory()) {
      await searchRoutes(app, routesDir, filepath);
    }
  }
};

export default (app: Express, routesDir?: string) => {
  return searchRoutes(app, routesDir);
};
