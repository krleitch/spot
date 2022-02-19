import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { ReportCategory } from '@models/../newModels/report.js';

const createSpotReport = async (
  spotId: string,
  reporterId: string,
  content: string,
  category: ReportCategory
): Promise<P.Report> => {
  const report = await prisma.report.create({
    data: {
      reporterId: reporterId,
      spotId: spotId,
      content: content,
      category: category
    }
  });
  return report;
};

const createCommentReport = async (
  spotId: string,
  commentId: string,
  reporterId: string,
  content: string,
  category: ReportCategory
): Promise<P.Report> => {
  const report = await prisma.report.create({
    data: {
      reporterId: reporterId,
      spotId: spotId,
      commentId: commentId,
      content: content,
      category: category
    }
  });
  return report;
};

export default {
  createSpotReport,
  createCommentReport
};
