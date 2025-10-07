import ImageKit from "@imagekit/nodejs";

export const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!, // This is the default and can be omitted
});
