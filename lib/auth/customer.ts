import { Customer } from "@prisma/client";
import prisma from "../prisma";

export const signUpCustomer = async (
  email: string,
  name: string,
  password: string
) => {
  if (!password || password.length < 8) {
    return {
      success: false,
      message: "Password must be at least 8 characters long.",
    };
  }

  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      return {
        success: false,
        message: "A customer with this email already exists.",
      };
    }

    const newCustomer = await prisma.customer.create({
      data: {
        email,
        name,
        password: password,
      },
    });

    return {
      success: true,
      message: "Customer account created successfully.",
      customerId: newCustomer.id,
    };
  } catch (error) {
    console.error("Customer sign-up error:", error);
    return {
      success: false,
      message: "Could not create customer account.",
    };
  }
};

export const signInCustomer = async (email: string, password: string) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      return { success: false, message: "No customer found with this email." };
    }

    // const isPasswordValid = await comparePassword(password, customer.password);
    // if (!isPasswordValid) {
    //   return { success: false, message: "Invalid password." };
    // }

    return {
      success: true,
      message: "Customer signed in successfully.",
      customer,
    };
  } catch (error) {
    console.error("Customer sign-in error:", error);
    return {
      success: false,
      message: "An error occurred during customer sign-in.",
    };
  }
};

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id } });
    return customer;
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return null;
  }
};
