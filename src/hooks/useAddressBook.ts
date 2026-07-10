import { useState, useCallback } from "react";
import { addressApi, type Address } from "../api/address.service";
import toast from "react-hot-toast";

export const useAddressBook = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await addressApi.getAddresses();
      setAddresses(res.data || []);
      return res.data || [];
    } catch (error) {
      toast.error("Failed to load addresses.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAddress = useCallback(async (data: Parameters<typeof addressApi.createAddress>[0]) => {
    try {
      setIsSubmitting(true);
      const res = await addressApi.createAddress(data);
      setAddresses(prev => [...prev, res.data]);
      toast.success("Address added successfully!");
      return res.data;
    } catch (error) {
      toast.error("Failed to add address.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateAddress = useCallback(async (id: string, data: Parameters<typeof addressApi.updateAddress>[1]) => {
    try {
      setIsSubmitting(true);
      const res = await addressApi.updateAddress(id, data);
      setAddresses(prev => prev.map(a => a._id === id ? res.data : a));
      toast.success("Address updated successfully!");
      return res.data;
    } catch (error) {
      toast.error("Failed to update address.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteAddress = useCallback(async (id: string) => {
    try {
      setIsSubmitting(true);
      await addressApi.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a._id !== id));
      toast.success("Address deleted.");
    } catch (error) {
      toast.error("Failed to delete address.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const setDefaultAddress = useCallback(async (id: string) => {
    try {
      setIsSubmitting(true);
      const res = await addressApi.setDefaultAddress(id);
      setAddresses(prev =>
        prev.map(a => ({ ...a, isDefault: a._id === id }))
      );
      toast.success("Default address updated!");
      return res.data;
    } catch (error) {
      toast.error("Failed to set default address.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    addresses,
    loading,
    isSubmitting,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
};
