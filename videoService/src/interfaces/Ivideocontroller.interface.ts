import { Request, Response } from 'express';

export interface IVideoController {
  getVideo(req: Request, res: Response): Promise<void>;
  getVideos(req: Request, res: Response): Promise<void>;
  genPresignedurl(req: Request, res: Response): Promise<void>;
  videoDataSave(req: Request, res: Response): Promise<void>;
  getUseruploadedvideo(req: Request, res: Response): Promise<void>;
}
