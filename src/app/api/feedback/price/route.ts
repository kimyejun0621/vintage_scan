/**
 * Price feedback API endpoint
 * Collects user feedback on price accuracy
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface PriceFeedbackRequest {
  brand: string;
  product_name: string;
  ai_estimated_krw: number;
  actual_sold_krw?: number;
  feedback_type?: 'accurate' | 'too_high' | 'too_low' | 'sold';
  marketplace?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PriceFeedbackRequest = await request.json();

    // Validate required fields
    if (!body.brand || !body.product_name || !body.ai_estimated_krw) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('[PriceFeedback] Received feedback:', {
      brand: body.brand,
      product: body.product_name,
      type: body.feedback_type,
      hasActualPrice: !!body.actual_sold_krw
    });

    // Submit feedback to database
    const { data, error } = await supabase.rpc('submit_price_feedback', {
      p_brand: body.brand.toLowerCase(),
      p_product_name: body.product_name,
      p_ai_estimated_krw: body.ai_estimated_krw,
      p_actual_sold_krw: body.actual_sold_krw || null,
      p_feedback_type: body.feedback_type || null,
      p_marketplace: body.marketplace || null,
      p_notes: body.notes || null,
      p_analysis_data: null
    });

    if (error) {
      console.error('[PriceFeedback] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    console.log('[PriceFeedback] Feedback submitted successfully:', data);

    return NextResponse.json({
      success: true,
      id: data,
      message: 'Thank you for your feedback!'
    });
  } catch (error) {
    console.error('[PriceFeedback] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve accuracy stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');

    const { data, error } = await supabase.rpc('get_price_accuracy_stats', {
      p_brand: brand?.toLowerCase() || null
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[PriceFeedback] Error getting stats:', error);
    return NextResponse.json(
      { error: 'Failed to get accuracy stats' },
      { status: 500 }
    );
  }
}
