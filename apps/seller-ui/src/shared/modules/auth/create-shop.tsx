import { shopCategories } from "@/utils/categories";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";

function CreateShop({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const createShopMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-shop`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = async (data: any) => {
    //console.log({ seller: sellerId });
    const shopData = { ...data, sellerId };
    createShopMutation.mutate(shopData);
  };

  const countWords = (text: string) => text.trim().split(/\s+/).length;

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup New Shop
        </h3>

        <label className="block text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          placeholder="Shop name"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("name", {
            required: "Name is required",
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.name.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1">
          Bio (Max 100 words) *
        </label>
        <input
          type="text"
          placeholder="Shop bio"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("bio", {
            required: "Shop bio is required",
            validate: (value) =>
              countWords(value) <= 100 || "Bio cant exceed 100 words",
          })}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.bio.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Address *</label>
        <input
          type="text"
          placeholder="Shop address"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("address", {
            required: "Shop address is required",
          })}
        />
        {errors.address && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.address.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Opening Hours *</label>
        <input
          type="text"
          placeholder="e.g., Mon-Fri 9AM - 6PM"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("opening_hours", {
            required: "Opening hours is required",
          })}
        />
        {errors.opening_hours && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.opening_hours.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Website </label>
        <input
          type="url"
          placeholder="https://example.com"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("website", {
            pattern: {
              value:
                /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/,
              message: "Please enter a valid URL",
            },
          })}
        />
        {errors.website && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.website.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1 mt-4">Category</label>
        <select
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("category", { required: "Category is required" })}
        >
          <option value="">Select a category</option>
          {shopCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.category.message)}
          </p>
        )}

        <button
          type="submit"
          className="w-full text-lg cursor-pointer mt-4 bg-[#C6223B] text-white p-2 rounded-[4px] hover:bg-red-400 transition"
        >
          Create
        </button>
      </form>
    </div>
  );
}

export default CreateShop;
