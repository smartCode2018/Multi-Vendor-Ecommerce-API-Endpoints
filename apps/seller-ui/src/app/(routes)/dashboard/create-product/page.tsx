"use client";
import React, { useState } from "react";
import { ChevronRight, Clock6 } from "lucide-react";
import { useForm } from "react-hook-form";
import ImagePlaceHolder from "@/shared/components/image-placeholder";
import Input from "../../../../../../../packages/components /input";
import ColorSelector from "../../../../../../../packages/components /color-selector";
import CustomSpecifications from "../../../../../../../packages/components /custom-specification";
import CustomProperties from "../../../../../../../packages/components /custom-properties";

const Page = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const handleImageChange = (file: File | null, index: number) => {
    const updatedImages = [...images];
    updatedImages[index] = file;

    if (index === images.length - 1 && images.length < 8) {
      updatedImages.push(null);
    }
    setImages(updatedImages);
    setValue("images", updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      let updatedImages = [...prevImages];

      if (index === -1) {
        updatedImages[0] = null;
      } else {
        updatedImages.splice(index, 1);
      }

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      return updatedImages;
    });
    setValue("images", images);
  };

  return (
    <div>
      <form
        className=" w-full mx-auto p-8 shadow-md rounded-lg text-white"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Heading $ Breadcrumb */}
        <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
          Create Product
        </h2>
        <div className="flex items-center">
          <span className="text-[#ea8080] cursor-pointer">Dashboard</span>
          <ChevronRight size={20} className="opacity-[.8]" />
          <span>Create Product</span>
        </div>
        {/* Content Layout */}
        <div className="py-4 w-full flex gap-6">
          {/* left side - image section */}
          <div className="md:w-[35%]">
            {images?.length > 0 && (
              <ImagePlaceHolder
                setOpenImageModal={setOpenImageModal}
                size="765 x 850"
                small={false}
                index={0}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            )}

            <div className="grid grid-cols-2 gap-3 mt-4 ">
              {images.slice(1).map((_, index) => (
                <ImagePlaceHolder
                  key={index}
                  setOpenImageModal={setOpenImageModal}
                  size="765 x 850"
                  small={true}
                  index={index + 1}
                  onImageChange={handleImageChange}
                  onRemove={handleRemoveImage}
                />
              ))}
            </div>
          </div>

          {/* right side form inputs */}
          <div className="md:w-[65%]">
            <div className="w-full flex gap-6">
              {/* Product Title Input */}
              <div className="w-2/4">
                <Input
                  className="w-full border !outline-none border-gray-700 bg-transparent p-2 !rounded-md text-white"
                  label="Product Title *"
                  placeholder="Enter product title"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title.message as string}
                  </p>
                )}

                <div className="mt-2">
                  <Input
                    type="textarea"
                    rows={7}
                    cols={10}
                    className="w-full border !outline-none border-gray-700 bg-transparent p-2 !rounded-md text-white"
                    label="Short Description (Max 150 words) *"
                    placeholder="Enter product description for quick view"
                    {...register("description", {
                      required: "Description is required",
                      validate: (value) => {
                        const wordCount = value.trim().split(/\s+/).length;
                        return (
                          wordCount <= 150 ||
                          `Description cannot exceed 150 words (Current: ${wordCount})`
                        );
                      },
                    })}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description.message as string}
                    </p>
                  )}
                </div>
                <div className="mt-2">
                  <Input
                    className="w-full border !outline-none border-gray-700 bg-transparent p-2 !rounded-md text-white"
                    label="Tags *"
                    placeholder="apple,flagship"
                    {...register("tags", {
                      required: "Separate related products tags with a coma,",
                    })}
                  />
                  {errors.tags && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.tags.message as string}
                    </p>
                  )}
                </div>

                <div className="mt-2">
                  <Input
                    className="w-full border !outline-none border-gray-700 bg-transparent p-2 !rounded-md text-white"
                    label="Warranty *"
                    placeholder="1 Year / No Warranty"
                    {...register("warranty", {
                      required: "Warranty is required!",
                    })}
                  />
                  {errors.warranty && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.warranty.message as string}
                    </p>
                  )}
                </div>

                <div className="mt-2">
                  <Input
                    label="Slug *"
                    placeholder="product_slug"
                    className="w-full border !outline-none border-gray-700 bg-transparent p-2 !rounded-md text-white"
                    {...register("slug", {
                      required: "Slug is required!",
                      pattern: {
                        value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                        message:
                          "Invalid slug format! Use only lowercase letters, numbers, and - or _ to join words",
                      },
                      minLength: {
                        value: 3,
                        message: "Slug must be at 3 least charaters long.",
                      },
                      maxLength: {
                        value: 50,
                        message: "Slug must be longer than 50 characters. ",
                      },
                    })}
                  />
                  {errors.slug && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.slug.message as string}
                    </p>
                  )}
                </div>

                <div className="mt-2">
                  <Input
                    label="Brand "
                    placeholder="Samsung"
                    className="w-full border !outline-none border-gray-700 bg-transparent p-2 !rounded-md text-white"
                    {...register("warranty")}
                  />
                  {errors.brand && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.brand.message as string}
                    </p>
                  )}
                </div>

                <div className="mt-2">
                  {/* color selector  */}
                  <ColorSelector
                    control={control}
                    errors={errors}
                    c1="w-7 h-7 p-2 rounded-md my-1 flex items-center justify-center !border-2 transition "
                    c2="w-8 h-8 flex items-center justify-center !rounded-full border-2 border-gray-500 bg-gray-800 hover:bg-gray-700 transition "
                    c3="px-3 py-1 bg-gray-700 text-white !rounded-md text-sm"
                    c4="scale-110 !border-white"
                    c5="!border-transparent"
                    c6="!border-gray-600"
                    c7="w-10 h-10 p-0 border-none cursor-pointer"
                    c8="relative flex items-center gap-2"
                    c9="block font-semibold text-gray-300 mb-1"
                    c10="flex gap-3 flex-wrap"
                    c11="mt-2"
                  />
                </div>
                <div className="mt-2">
                  <CustomSpecifications
                    control={control}
                    errors={errors}
                    c1="block font-semibold text-red-300 mb-1"
                    c2="flex flex-col gap-3"
                    c3="flex gap-2 items-center"
                    c4="text-red-500 hover:text-red-700"
                    c5="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                  />
                </div>

                <div className="mt-2">
                  <CustomProperties
                    control={control}
                    errors={errors}
                    c1="block font-semibold text-red-300 mb-1"
                    c2="flex flex-col gap-3"
                    c6="border border-gray-700 p-3 rounded-lg bg-gray-900"
                    c7="flex items-center justify-between"
                    c8="text-white font-medium"
                    c9="text-red-500"
                    c10="flex items-center mt-2 gap-2"
                    c11="w-full border !outline-none border-gray-700 bg-transparent p-2 !rounded-md text-white"
                    c12="px-3 py-2 bg-red-500 text-white rounded-md"
                    c13="flex flex-wrap gap-2 mt-2"
                    c14="px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
                    c15="text-red-500 text-xs mt-1"
                  />
                </div>

                <div className="mt-2">
                  <label className=" block font-semibold text-gray-300 mb-1">
                    Cash On Delivery *
                  </label>
                  <select
                    {...register("cash_on_delivery", {
                      required: "Cash on delivery is required",
                    })}
                    defaultValue="yes"
                    className="w-full border !outline-none border-gray-700 bg-transparent p-2 !rounded-md text-white"
                  >
                    <option value="yes" className="bg-black">
                      Yes
                    </option>
                    <option value="no" className="bg-black">
                      No
                    </option>
                  </select>
                  {errors.cash_on_delivery && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.cash_on_delivery.message as string}
                    </p>
                  )}
                </div>
              </div>
              <div className="w-2/4">
                <label className=" block font-semibold text-gray-300 mb-1">
                  Category *
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Page;
