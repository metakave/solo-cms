import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'leadId is required' }, { status: 400 });
    }

    const attachments = await prisma.attachment.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, attachments });
  } catch (error: any) {
    console.error('Error fetching attachments:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, fileName, fileType, fileSize, fileData } = body;

    if (!leadId || !fileName || !fileData) {
      return NextResponse.json(
        { success: false, error: 'leadId, fileName, and fileData are required' },
        { status: 400 }
      );
    }

    const attachment = await prisma.attachment.create({
      data: {
        leadId,
        fileName,
        fileType: fileType || 'application/octet-stream',
        fileSize: Number(fileSize) || 0,
        fileData,
      },
    });

    // Log to activity timeline
    const readableSize =
      fileSize >= 1024 * 1024
        ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(fileSize / 1024)} KB`;

    await prisma.activityLog.create({
      data: {
        leadId,
        type: 'NOTE',
        content: `Attached document: "${fileName}" (${readableSize}).`,
      },
    });

    return NextResponse.json({ success: true, attachment }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading attachment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    const existing = await prisma.attachment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Attachment not found' }, { status: 404 });
    }

    await prisma.attachment.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        leadId: existing.leadId,
        type: 'NOTE',
        content: `Removed attachment: "${existing.fileName}".`,
      },
    });

    return NextResponse.json({ success: true, message: 'Attachment deleted' });
  } catch (error: any) {
    console.error('Error deleting attachment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
