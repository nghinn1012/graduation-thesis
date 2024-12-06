import { Request, Response } from "express";
import { createComplaintService, getComplaintsService } from "../services/complaints.services";
import { AuthRequest } from "../data";

export const createComplaintController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { postId, reason, description } = req.body;
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    const result = await createComplaintService(postId, userId, reason, description);
    res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
};

export const getComplaintsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { page, pageSize } = req.query;
    const complaints = await getComplaintsService(
      Number(page),
      Number(pageSize)
    );
    res.status(200).json(complaints);
  } catch (error) {
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
}
