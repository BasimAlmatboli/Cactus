import { Offer } from '../types';
import { supabase } from '../lib/supabase';
import { generateUUID } from '../utils/uuid';

export const transformSupabaseOffer = (supabaseOffer: any): Offer => {
  return {
    id: supabaseOffer.id,
    name: supabaseOffer.name,
    description: supabaseOffer.description,
    triggerProductId: supabaseOffer.trigger_product_id,
    triggerProductName: supabaseOffer.trigger_product_name,
    targetProductId: supabaseOffer.target_product_id,
    targetProductName: supabaseOffer.target_product_name,
    discountType: supabaseOffer.discount_type,
    discountValue: Number(supabaseOffer.discount_value),
    isActive: supabaseOffer.is_active,
    startDate: supabaseOffer.start_date,
    endDate: supabaseOffer.end_date,
    createdAt: supabaseOffer.created_at,
    updatedAt: supabaseOffer.updated_at,
  };
};

export const transformOfferForSupabase = (offer: Partial<Offer>) => {
  return {
    id: offer.id,
    name: offer.name,
    description: offer.description || '',
    trigger_product_id: offer.triggerProductId,
    trigger_product_name: offer.triggerProductName,
    target_product_id: offer.targetProductId,
    target_product_name: offer.targetProductName,
    discount_type: offer.discountType,
    discount_value: offer.discountValue,
    is_active: offer.isActive !== undefined ? offer.isActive : true,
    start_date: offer.startDate || null,
    end_date: offer.endDate || null,
  };
};

export const getOffers = async (): Promise<Offer[]> => {
  const { data: offers, error } = await supabase
    .from('offers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading offers:', error);
    throw error;
  }

  return offers.map(transformSupabaseOffer);
};

export const getActiveOffers = async (): Promise<Offer[]> => {
  const today = new Date().toISOString().split('T')[0];

  const { data: offers, error } = await supabase
    .from('offers')
    .select('*')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${today}`)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading active offers:', error);
    throw error;
  }

  return offers.map(transformSupabaseOffer);
};

export const getOfferById = async (offerId: string): Promise<Offer | null> => {
  const { data: offer, error } = await supabase
    .from('offers')
    .select('*')
    .eq('id', offerId)
    .maybeSingle();

  if (error) {
    console.error('Error getting offer:', error);
    throw error;
  }

  return offer ? transformSupabaseOffer(offer) : null;
};

export const createOffer = async (offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Offer> => {
  const newOffer = {
    ...offer,
    id: generateUUID(),
  };

  const supabaseOffer = transformOfferForSupabase(newOffer);

  const { data, error } = await supabase
    .from('offers')
    .insert(supabaseOffer)
    .select()
    .single();

  if (error) {
    console.error('Error creating offer:', error);
    throw error;
  }

  return transformSupabaseOffer(data);
};

export const updateOffer = async (offerId: string, updates: Partial<Offer>): Promise<Offer> => {
  const supabaseUpdates = transformOfferForSupabase(updates);

  const { data, error } = await supabase
    .from('offers')
    .update({
      ...supabaseUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', offerId)
    .select()
    .single();

  if (error) {
    console.error('Error updating offer:', error);
    throw error;
  }

  return transformSupabaseOffer(data);
};

export const deleteOffer = async (offerId: string): Promise<void> => {
  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', offerId);

  if (error) {
    console.error('Error deleting offer:', error);
    throw error;
  }
};

export const toggleOfferStatus = async (offerId: string, isActive: boolean): Promise<Offer> => {
  return updateOffer(offerId, { isActive });
};
