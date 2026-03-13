import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isToday } from 'date-fns';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

let supabaseClient: SupabaseClient | null = null;
let cloudFailureListener: ((error: Error) => void) | null = null;

export class CloudConfigurationError extends Error {
  constructor() {
    super('Missing Supabase configuration.');
    this.name = 'CloudConfigurationError';
  }
}

export class CloudOperationError extends Error {
  constructor(operation: string, cause?: unknown) {
    const details = cause instanceof Error ? cause.message : 'Unknown cloud error.';
    super(`Cloud operation failed while trying to ${operation}: ${details}`);
    this.name = 'CloudOperationError';
  }
}

function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    throw new CloudConfigurationError();
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseClient;
}

function buildCloudError(operation: string, cause: unknown): Error {
  if (cause instanceof CloudConfigurationError || cause instanceof CloudOperationError) {
    return cause;
  }

  return new CloudOperationError(operation, cause);
}

function handleCloudFailure(operation: string, cause: unknown): never {
  const error = buildCloudError(operation, cause);
  console.error(`Cloud operation failed (${operation}):`, cause);
  cloudFailureListener?.(error);
  throw error;
}

function mapSettings(settings: any) {
  return {
    reading: {
      noRep: {
        words: settings.reading_no_rep_words,
        sentences: settings.reading_no_rep_sentences,
      },
      interval: {
        words: settings.reading_interval_words,
        sentences: settings.reading_interval_sentences,
      },
      books: {
        allowAllBooks: settings.reading_allow_all_books,
      },
      wordSpacing: settings.reading_word_spacing || 1,
    },
    drawings: {
      showCaptions: settings.drawings_show_captions,
      interval: settings.drawings_interval,
      randomOrder: settings.drawings_random_order,
      showFacts: settings.drawings_show_facts ?? false,
    },
    math: {
      equations: {
        interval: settings.math_equations_interval ?? 1500,
        equationCount: settings.math_equations_equation_count ?? 5,
      },
      numbers: {
        interval: settings.math_numbers_interval ?? 1000,
        numberCount: settings.math_numbers_number_count ?? 10,
      },
    },
  };
}

export function setCloudFailureListener(listener: ((error: Error) => void) | null) {
  cloudFailureListener = listener;
}

export function ignoreCloudFailure() {
  // StoreProvider already handles the blocking fallback via the shared listener.
}

// biome-ignore lint/complexity/noStaticOnlyClass: Static-only service aligns with app architecture
export class SupabaseService {
  static validateConfiguration() {
    getSupabaseClient();
  }

  static async getSettings() {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.from('settings').select('*').eq('id', 1).maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        const { data: newSettings, error: insertError } = await client
          .from('settings')
          .insert({ id: 1 })
          .select()
          .single();

        if (insertError || !newSettings) {
          throw insertError ?? new Error('Failed to create default settings row.');
        }

        return mapSettings(newSettings);
      }

      return mapSettings(data);
    } catch (error) {
      handleCloudFailure('load settings', error);
    }
  }

  static async updateSettings(settings: any) {
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('settings').upsert(
        {
          id: 1,
          reading_no_rep_words: settings.reading.noRep.words,
          reading_no_rep_sentences: settings.reading.noRep.sentences,
          reading_interval_words: settings.reading.interval.words,
          reading_interval_sentences: settings.reading.interval.sentences,
          reading_allow_all_books: settings.reading.books.allowAllBooks,
          reading_word_spacing: settings.reading.wordSpacing || 1,
          drawings_show_captions: settings.drawings.showCaptions,
          drawings_interval: settings.drawings.interval,
          drawings_random_order: settings.drawings.randomOrder,
          drawings_show_facts: settings.drawings.showFacts,
          math_equations_interval: settings.math?.equations?.interval ?? 1500,
          math_equations_equation_count: settings.math?.equations?.equationCount ?? 5,
          math_numbers_interval: settings.math?.numbers?.interval ?? 1000,
          math_numbers_number_count: settings.math?.numbers?.numberCount ?? 10,
        },
        { onConflict: 'id' }
      );

      if (error) {
        throw error;
      }
    } catch (error) {
      handleCloudFailure('save settings', error);
    }
  }

  static async getBookProgress() {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.from('book_progress').select('*');

      if (error) {
        throw error;
      }

      return (data ?? []).map((item) => ({
        bookId: typeof item.book_index === 'number' ? item.book_index : 0,
        bookTitle: item.book_title || item.book_id,
        completedTriples: item.completed_triples || [],
        progressTimestamp: item.progress_timestamp
          ? new Date(item.progress_timestamp).getTime()
          : 0,
        isCompleted: !!item.is_completed,
      }));
    } catch (error) {
      handleCloudFailure('load book progress', error);
    }
  }

  static async updateBookProgress(bookProgress: any[]) {
    try {
      const client = getSupabaseClient();
      const payload = bookProgress.map((progress) => ({
        book_id: progress.bookTitle || String(progress.bookId),
        book_index: progress.bookId,
        book_title: progress.bookTitle || String(progress.bookId),
        completed_triples: progress.completedTriples || [],
        progress_timestamp: progress.progressTimestamp
          ? new Date(progress.progressTimestamp).toISOString()
          : null,
        is_completed: !!progress.isCompleted,
      }));

      const { error } = await client.from('book_progress').upsert(payload, {
        onConflict: 'book_id',
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      handleCloudFailure('save book progress', error);
    }
  }

  static async getBookTrackSessions() {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('book_track_sessions')
        .select('*')
        .order('completed_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map((item) => ({
        session: item.session_name,
        type: item.content_type,
        timestamp: new Date(item.completed_at).getTime(),
      }));
    } catch (error) {
      handleCloudFailure('load reading session completions', error);
    }
  }

  static async saveBookTrackSession(sessions: any[]) {
    const lastSession = sessions[sessions.length - 1];
    if (!lastSession) {
      return;
    }

    try {
      const client = getSupabaseClient();
      const { error } = await client.from('book_track_sessions').insert({
        session_name: lastSession.session,
        content_type: lastSession.type,
        completed_at: new Date(lastSession.timestamp).toISOString(),
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      handleCloudFailure('save reading session completion', error);
    }
  }

  static async getNoRepProgress(contentType: 'words' | 'sentences') {
    const id = contentType === 'words' ? 1 : 2;

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('no_rep_progress')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        const { data: newProgress, error: insertError } = await client
          .from('no_rep_progress')
          .insert({ id, content_type: contentType, displayed_items: [] })
          .select()
          .single();

        if (insertError || !newProgress) {
          throw insertError ?? new Error('Failed to create no-repetition progress row.');
        }

        return newProgress.displayed_items || [];
      }

      return data.displayed_items || [];
    } catch (error) {
      handleCloudFailure(`load no-repetition ${contentType}`, error);
    }
  }

  static async updateNoRepProgress(contentType: 'words' | 'sentences', items: string[]) {
    const id = contentType === 'words' ? 1 : 2;

    try {
      const client = getSupabaseClient();
      const { error } = await client.from('no_rep_progress').upsert(
        {
          id,
          content_type: contentType,
          displayed_items: items,
        },
        { onConflict: 'id' }
      );

      if (error) {
        throw error;
      }
    } catch (error) {
      handleCloudFailure(`save no-repetition ${contentType}`, error);
    }
  }

  static async getNoRepCompletions(contentType: 'words' | 'sentences') {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('no_rep_completions')
        .select('*')
        .eq('content_type', contentType)
        .order('completed_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map((item) => new Date(item.completed_at).getTime());
    } catch (error) {
      handleCloudFailure(`load no-repetition completion history for ${contentType}`, error);
    }
  }

  static async saveNoRepCompletion(contentType: 'words' | 'sentences') {
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('no_rep_completions').insert({
        content_type: contentType,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      handleCloudFailure(`save no-repetition completion for ${contentType}`, error);
    }
  }

  static async getMathProgress() {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('math_progress')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        const { data: newProgress, error: insertError } = await client
          .from('math_progress')
          .insert({ id: 1, current_day: 1, last_session_date: null, completed_sessions: [] })
          .select()
          .single();

        if (insertError || !newProgress) {
          throw insertError ?? new Error('Failed to create math progress row.');
        }

        return {
          currentDay: newProgress.current_day,
          lastSessionDate: newProgress.last_session_date,
          completedSessions: newProgress.completed_sessions || [],
        };
      }

      return {
        currentDay: data.current_day,
        lastSessionDate: data.last_session_date,
        completedSessions: data.completed_sessions || [],
      };
    } catch (error) {
      handleCloudFailure('load math progress', error);
    }
  }

  static async updateMathProgress(progress: any) {
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('math_progress').upsert(
        {
          id: 1,
          current_day: progress.currentDay,
          last_session_date: progress.lastSessionDate,
          completed_sessions: progress.completedSessions,
        },
        { onConflict: 'id' }
      );

      if (error) {
        throw error;
      }
    } catch (error) {
      handleCloudFailure('save math progress', error);
    }
  }

  static async saveMathSessionCompletion(completionData: any) {
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('math_session_completions').insert({
        session_type: completionData.session,
        day_number: completionData.day,
        completed_at: new Date(completionData.timestamp || Date.now()).toISOString(),
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      handleCloudFailure('save math session completion', error);
    }
  }

  static async getEquationsProgress() {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('equations_progress')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        const { data: newProgress, error: insertError } = await client
          .from('equations_progress')
          .insert({
            id: 1,
            current_day: 1,
            current_category: 'integer',
            last_session_date: null,
            completed_sessions: [],
          })
          .select()
          .single();

        if (insertError || !newProgress) {
          throw insertError ?? new Error('Failed to create equations progress row.');
        }

        return {
          currentDay: newProgress.current_day,
          currentCategory: newProgress.current_category,
          lastSessionDate: newProgress.last_session_date,
          completedSessions: newProgress.completed_sessions || [],
        };
      }

      return {
        currentDay: data.current_day,
        currentCategory: data.current_category,
        lastSessionDate: data.last_session_date,
        completedSessions: data.completed_sessions || [],
      };
    } catch (error) {
      handleCloudFailure('load equations progress', error);
    }
  }

  static async updateEquationsProgress(progress: any) {
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('equations_progress').upsert(
        {
          id: 1,
          current_day: progress.currentDay,
          current_category: progress.currentCategory,
          last_session_date: progress.lastSessionDate,
          completed_sessions: progress.completedSessions,
        },
        { onConflict: 'id' }
      );

      if (error) {
        throw error;
      }
    } catch (error) {
      handleCloudFailure('save equations progress', error);
    }
  }

  static async saveEquationsSessionCompletion(completionData: any) {
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('equations_session_completions').insert({
        session_type: completionData.session,
        day_number: completionData.day,
        category: completionData.category,
        completed_at: new Date(completionData.timestamp || Date.now()).toISOString(),
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      handleCloudFailure('save equations session completion', error);
    }
  }

  static async getDrawingPresentations() {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('drawing_presentations')
        .select('*')
        .order('presented_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map((item) => ({
        setTitle: item.set_title,
        timestamp: new Date(item.presented_at).getTime(),
      }));
    } catch (error) {
      handleCloudFailure('load drawing presentations', error);
    }
  }

  static async saveDrawingPresentation(presentations: any[]) {
    const lastPresentation = presentations[presentations.length - 1];
    if (!lastPresentation) {
      return;
    }

    try {
      const client = getSupabaseClient();
      const { error } = await client.from('drawing_presentations').insert({
        set_title: lastPresentation.setTitle,
        presented_at: new Date(lastPresentation.timestamp).toISOString(),
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      handleCloudFailure('save drawing presentation', error);
    }
  }

  static async getTodaysDailyPlan() {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('daily_plans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const plan = data[0];
      if (!isToday(new Date(plan.created_at))) {
        return null;
      }

      return {
        timestamp: new Date(plan.created_at).getTime(),
        bookId: plan.book_id,
        selectedWordTripleIndex: plan.selected_word_triple_index,
        selectedSentenceTripleIndex: plan.selected_sentence_triple_index,
        sessions: {
          session1: plan.session1_content,
          session2: plan.session2_content,
          session3: plan.session3_content,
        },
      };
    } catch (error) {
      handleCloudFailure("load today's reading plan", error);
    }
  }
}
