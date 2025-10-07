import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/error-handler";
import { imagekit } from "../../../../packages/libs/imagekit";
import fs from "fs";

//get product categories
export const getProductCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();
    if (!config) {
      return res.status(404).json({ message: "Site configuration not found" });
    }
    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCatergories,
    });
  } catch (error) {
    return next(error);
  }
};

//create discount codes
export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discount_type, discount_value, discount_code } =
      req.body;
    if (!public_name || !discount_type || !discount_value || !discount_code) {
      return next(new ValidationError("All fields are required"));
    }

    const isDiscontCodeExists = await prisma.discount_codes.findUnique({
      where: {
        discount_code: discount_code,
      },
    });

    if (isDiscontCodeExists) {
      return next(new ValidationError("Discount code already exists"));
    }

    const newDiscountCode = await prisma.discount_codes.create({
      data: {
        public_name,
        discount_type,
        discount_value: parseFloat(discount_value),
        discount_code,
        sellerId: req.seller.id,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Discount code created successfully",
      discountCode: newDiscountCode,
    });
  } catch (error) {}
};

//get discount codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discountCodes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
    });
    return res.status(200).json({
      success: true,
      discountCodes,
    });
  } catch (error) {
    return next(error);
  }
};

//delete discount code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    const discountCode = await prisma.discount_codes.findUnique({
      where: {
        id,
      },
      select: { id: true, sellerId: true },
    });

    if (!discountCode) {
      return next(new ValidationError("Discount code not found"));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(
        new ValidationError(
          "You are not authorized to delete this discount code"
        )
      );
    }
    await prisma.discount_codes.delete({
      where: {
        id,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Discount code deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//upload product images
export const uploadProductImages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { filePath } = req.body;

    const response = await imagekit.files.upload({
      file: fs.createReadStream(filePath),
      fileName: `product-${Date.now()}.jpg`,
      folder: "/products",
    });
    return res.status(200).json({
      success: true,
      imageUrl: response.url,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//delete product images
export const deleteProductImages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { imageId } = req.body;

    if (!imageId) {
      return next(new ValidationError("File ID is required"));
    }

    await imagekit.files.delete(imageId);

    return res.status(201).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//create product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      videoUrl,
      category,
      colors = [],
      sizes = [],
      discount_codes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      custom_properties = {},
      images = [],
    } = req.body;

    if (
      !title ||
      !short_description ||
      !slug ||
      !category ||
      !subCategory ||
      !tags ||
      !images ||
      !stock ||
      !sale_price ||
      !regular_price
    ) {
      return next(new ValidationError("All fields are required"));
    }
    if (!req.seller.id) {
      return next(new ValidationError("Seller not found"));
    }

    const slugExists = await prisma.products.findUnique({
      where: {
        slug,
      },
      select: { id: true },
    });

    if (slugExists) {
      return next(new ValidationError("Slug already exists"));
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cash_on_delivery,
        slug,
        shopId: req.seller?.shop?.id!,
        tags: Array.isArray(tags) ? tags : tags.split(","),
        brand,
        videoUrl,
        category,
        subCategory,
        colors: colors || [],
        discount_codes: discount_codes.map((codeId: string) => codeId) || [],
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        custom_properties: custom_properties || {},
        custom_specifications: custom_specifications || {},
        images: {
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((img: any) => ({
              file_id: img.fileId,
              url: img.file_url,
            })),
        },
      },
      include: { images: true },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    return next(error);
  }
};

//get logged in seller products
export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        shopId: req.seller?.shop?.id,
        isDeleted: false,
      },
      include: {
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

//delete product (soft delete)
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerShopId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return next(new ValidationError("Product not found"));
    }

    if (product.shopId !== sellerShopId) {
      return next(
        new ValidationError("You are not authorized to delete this product")
      );
    }

    if (product.isDeleted) {
      return next(new ValidationError("Product is already deleted"));
    }
    const deletedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product: deletedProduct.deletedAt,
    });
    // Note: Permanent deletion of the product after 24 hours can be handled by a scheduled job or a cron job that runs periodically to check for products with deletedAt older than 24 hours and then permanently deletes them from the database.
  } catch (error) {
    return next(error);
  }
};

//restore soft deleted product (if within 24 hours)
export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerShopId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true, deletedAt: true },
    });

    if (!product) {
      return next(new ValidationError("Product not found"));
    }

    if (product.shopId !== sellerShopId) {
      return next(
        new ValidationError("You are not authorized to restore this product")
      );
    }

    if (!product.isDeleted) {
      return next(new ValidationError("Product is not deleted"));
    }

    if (
      product.deletedAt &&
      new Date() > new Date(product.deletedAt.getTime() + 24 * 60 * 60 * 1000)
    ) {
      return next(
        new ValidationError(
          "Cannot restore product. The 24-hour restoration period has expired."
        )
      );
    }

    const restoredProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product restored successfully",
      product: restoredProduct,
    });
  } catch (error) {
    return next(error);
  }
};
