/**
 * @file supabase-api.ts
 * @description Supabase 데이터베이스 API 함수
 *
 * 북마크 관련 Supabase 쿼리 함수들
 *
 * 주요 기능:
 * 1. 북마크 조회
 * 2. 북마크 추가
 * 3. 북마크 제거
 * 4. 사용자 북마크 목록 조회
 *
 * @dependencies
 * - @/lib/supabase/clerk-client: useClerkSupabaseClient (클라이언트용)
 * - @/lib/supabase/server: createClerkSupabaseClient (서버용)
 * - @clerk/nextjs: auth (서버 인증)
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * Clerk user ID를 Supabase users 테이블의 user_id로 변환
 * @param clerkUserId - Clerk User ID
 * @returns Supabase users 테이블의 UUID 또는 null
 */
async function getSupabaseUserId(clerkUserId: string): Promise<string | null> {
  try {
    const supabase = await createClerkSupabaseClient();
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (error || !data) {
      console.error("Supabase user 조회 실패:", error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error("Supabase user 조회 실패:", error);
    return null;
  }
}

/**
 * 북마크 조회
 * @param contentId - 콘텐츠 ID
 * @returns 북마크 존재 여부
 */
export async function getBookmark(contentId: string): Promise<boolean> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return false;
  }

  try {
    const supabaseUserId = await getSupabaseUserId(clerkUserId);
    if (!supabaseUserId) {
      return false;
    }

    const supabase = await createClerkSupabaseClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", supabaseUserId)
      .eq("content_id", contentId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116은 "no rows returned" 에러 (정상적인 경우)
      console.error("북마크 조회 실패:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("북마크 조회 실패:", error);
    return false;
  }
}

/**
 * 북마크 추가
 * @param contentId - 콘텐츠 ID
 * @returns 성공 여부
 */
export async function addBookmark(contentId: string): Promise<boolean> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error("로그인이 필요합니다");
  }

  try {
    const supabaseUserId = await getSupabaseUserId(clerkUserId);
    if (!supabaseUserId) {
      throw new Error("사용자 정보를 찾을 수 없습니다");
    }

    const supabase = await createClerkSupabaseClient();
    const { error } = await supabase.from("bookmarks").insert({
      user_id: supabaseUserId,
      content_id: contentId,
    });

    if (error) {
      // 중복 키 에러는 무시 (이미 북마크된 경우)
      if (error.code === "23505") {
        return true;
      }
      console.error("북마크 추가 실패:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("북마크 추가 실패:", error);
    return false;
  }
}

/**
 * 북마크 제거
 * @param contentId - 콘텐츠 ID
 * @returns 성공 여부
 */
export async function removeBookmark(contentId: string): Promise<boolean> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error("로그인이 필요합니다");
  }

  try {
    const supabaseUserId = await getSupabaseUserId(clerkUserId);
    if (!supabaseUserId) {
      throw new Error("사용자 정보를 찾을 수 없습니다");
    }

    const supabase = await createClerkSupabaseClient();
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", supabaseUserId)
      .eq("content_id", contentId);

    if (error) {
      console.error("북마크 제거 실패:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("북마크 제거 실패:", error);
    return false;
  }
}

/**
 * 사용자 북마크 목록 조회
 * @returns 북마크된 콘텐츠 ID 배열
 */
export async function getUserBookmarks(): Promise<string[]> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return [];
  }

  try {
    const supabaseUserId = await getSupabaseUserId(clerkUserId);
    if (!supabaseUserId) {
      return [];
    }

    const supabase = await createClerkSupabaseClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .select("content_id")
      .eq("user_id", supabaseUserId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("북마크 목록 조회 실패:", error);
      return [];
    }

    return data?.map((item) => item.content_id) || [];
  } catch (error) {
    console.error("북마크 목록 조회 실패:", error);
    return [];
  }
}

