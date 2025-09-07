import { createClient } from '@supabase/supabase-js';
import { isToday } from 'date-fns';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// biome-ignore lint/complexity/noStaticOnlyClass: Static-only service aligns with app architecture
export class SupabaseService {
  // Settings
  static async getSettings() {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1);

    if (error) {
      console.error('Error fetching settings from Supabase:', error);
      return null;
    }

    if (!data || data.length === 0) {
      // Settings not found, create default settings
      const { data: newSettings, error: insertError } = await supabase
        .from('settings')
        .insert({ id: 1 })
        .select();

      if (insertError || !newSettings || newSettings.length === 0) {
        return null;
      }

      const settings = newSettings[0];
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

    const settings = data[0];

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

  static async updateSettings(settings: any) {
    const { error } = await supabase
      .from('settings')
      .update({
        reading_no_rep_words: settings.reading.noRep.words,
        reading_no_rep_sentences: settings.reading.noRep.sentences,
        reading_interval_words: settings.reading.interval.words,
        reading_interval_sentences: settings.reading.interval.sentences,
        reading_allow_all_books: settings.reading.books.allowAllBooks,
        reading_word_spacing: settings.reading.wordSpacing || 1,
        drawings_show_captions: settings.drawings.showCaptions,
        drawings_interval: settings.drawings.interval,
        drawings_random_order: settings.drawings.randomOrder,
        math_equations_interval: settings.math?.equations?.interval ?? 1500,
        math_equations_equation_count: settings.math?.equations?.equationCount ?? 5,
        math_numbers_interval: settings.math?.numbers?.interval ?? 1000,
        math_numbers_number_count: settings.math?.numbers?.numberCount ?? 10,
      })
      .eq('id', 1);

    if (error) {
      console.error('Error updating settings in Supabase:', error);
    }
  }

  // Book Progress
  static async getBookProgress() {
    const { data, error } = await supabase.from('book_progress').select('*');

    if (error) {
      console.error('Error fetching book progress from Supabase:', error);
      return [];
    }

    return data.map((item) => {
      return {
        bookId: typeof item.book_index === 'number' ? item.book_index : 0,
        bookTitle: item.book_title || item.book_id, // fallback for old schema
        completedTriples: item.completed_triples || [],
        progressTimestamp: item.progress_timestamp
          ? new Date(item.progress_timestamp).getTime()
          : 0,
        isCompleted: item.is_completed,
      };
    });
  }

  static async updateBookProgress(bookProgress: any[]) {
    for (const progress of bookProgress) {
      const { error } = await supabase.from('book_progress').upsert(
        {
          // Use new identity columns only
          book_index: progress.bookId,
          book_title: progress.bookTitle || String(progress.bookId),
          completed_triples: progress.completedTriples,
          progress_timestamp: progress.progressTimestamp
            ? new Date(progress.progressTimestamp).toISOString()
            : null,
          is_completed: progress.isCompleted,
        },
        {
          // Conflict on new unique column
          onConflict: 'book_title',
        }
      );

      if (error) {
        console.error('Error updating book progress in Supabase:', error);
      }
    }
  }

  // Daily Plans
  static async getDailyPlan() {
    const { data, error } = await supabase
      .from('daily_plans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching daily plan from Supabase:', error);
      return null;
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
  }

  static async saveDailyPlan(dailyPlan: any) {
    const { data, error } = await supabase
      .from('daily_plans')
      .insert({
        book_id: dailyPlan.bookId,
        selected_word_triple_index: dailyPlan.selectedWordTripleIndex,
        selected_sentence_triple_index: dailyPlan.selectedSentenceTripleIndex,
        session1_content: dailyPlan.sessions.session1,
        session2_content: dailyPlan.sessions.session2,
        session3_content: dailyPlan.sessions.session3,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving daily plan to Supabase:', error);
      return null;
    }

    return data.id;
  }

  // Book Track Sessions
  static async getBookTrackSessions() {
    const { data, error } = await supabase
      .from('book_track_sessions')
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching book track sessions from Supabase:', error);
      return [];
    }

    return data.map((item) => ({
      session: item.session_name,
      type: item.content_type,
      timestamp: new Date(item.completed_at).getTime(),
    }));
  }

  static async saveBookTrackSession(sessions: any[]) {
    const lastSession = sessions[sessions.length - 1];
    if (!lastSession) return;

    const { error } = await supabase.from('book_track_sessions').insert({
      session_name: lastSession.session,
      content_type: lastSession.type,
      completed_at: new Date(lastSession.timestamp).toISOString(),
    });

    if (error) {
      console.error('Error saving book track session to Supabase:', error);
    }
  }

  // No-Rep Progress
  static async getNoRepProgress(contentType: 'words' | 'sentences') {
    const id = contentType === 'words' ? 1 : 2;
    const { data, error } = await supabase.from('no_rep_progress').select('*').eq('id', id);

    if (error) {
      console.error('Error fetching no-rep progress from Supabase:', error);
      return [];
    }

    if (!data || data.length === 0) {
      // Create the row if it doesn't exist
      const { data: newProgress, error: insertError } = await supabase
        .from('no_rep_progress')
        .insert({ id, content_type: contentType, displayed_items: [] })
        .select();

      if (insertError || !newProgress || newProgress.length === 0) {
        return [];
      }

      return newProgress[0].displayed_items || [];
    }

    return data[0]?.displayed_items || [];
  }

  static async updateNoRepProgress(contentType: 'words' | 'sentences', items: string[]) {
    const id = contentType === 'words' ? 1 : 2;
    const { error } = await supabase
      .from('no_rep_progress')
      .update({
        displayed_items: items,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating no-rep progress in Supabase:', error);
    }
  }

  // No-Rep Completions
  static async getNoRepCompletions(contentType: 'words' | 'sentences') {
    const { data, error } = await supabase
      .from('no_rep_completions')
      .select('*')
      .eq('content_type', contentType)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching no-rep completions from Supabase:', error);
      return [];
    }

    return data.map((item) => new Date(item.completed_at).getTime());
  }

  static async saveNoRepCompletion(contentType: 'words' | 'sentences') {
    const { error } = await supabase.from('no_rep_completions').insert({
      content_type: contentType,
    });

    if (error) {
      console.error('Error saving no-rep completion to Supabase:', error);
    }
  }

  // Math Progress
  static async getMathProgress() {
    const { data, error } = await supabase.from('math_progress').select('*').eq('id', 1);

    if (error) {
      console.error('Error fetching math progress from Supabase:', error);
      return null;
    }

    if (!data || data.length === 0) {
      // Create the row if it doesn't exist
      const { data: newProgress, error: insertError } = await supabase
        .from('math_progress')
        .insert({ id: 1, current_day: 1, last_session_date: null, completed_sessions: [] })
        .select();

      if (insertError || !newProgress || newProgress.length === 0) {
        return null;
      }

      return {
        currentDay: newProgress[0].current_day,
        lastSessionDate: newProgress[0].last_session_date,
        completedSessions: newProgress[0].completed_sessions || [],
      };
    }

    return {
      currentDay: data[0].current_day,
      lastSessionDate: data[0].last_session_date,
      completedSessions: data[0].completed_sessions || [],
    };
  }

  static async updateMathProgress(progress: any) {
    const { error } = await supabase
      .from('math_progress')
      .update({
        current_day: progress.currentDay,
        last_session_date: progress.lastSessionDate,
        completed_sessions: progress.completedSessions,
      })
      .eq('id', 1);

    if (error) {
      console.error('Error updating math progress in Supabase:', error);
    }
  }

  // Math Session Completions
  static async getMathSessionCompletions() {
    const { data, error } = await supabase
      .from('math_session_completions')
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching math session completions from Supabase:', error);
      return [];
    }

    return data.map((item) => ({
      session: item.session_type,
      day: item.day_number,
      timestamp: new Date(item.completed_at).getTime(),
    }));
  }

  static async saveMathSessionCompletion(completionData: any) {
    const { error } = await supabase.from('math_session_completions').insert({
      session_type: completionData.session,
      day_number: completionData.day,
      completed_at: new Date(completionData.timestamp || Date.now()).toISOString(),
    });

    if (error) {
      console.error('Error saving math session completion to Supabase:', error);
    }
  }

  // Equations Progress
  static async getEquationsProgress() {
    const { data, error } = await supabase.from('equations_progress').select('*').eq('id', 1);

    if (error) {
      console.error('Error fetching equations progress from Supabase:', error);
      return null;
    }

    if (!data || data.length === 0) {
      const { data: newProgress, error: insertError } = await supabase
        .from('equations_progress')
        .insert({
          id: 1,
          current_day: 1,
          current_category: 'integer',
          last_session_date: null,
          completed_sessions: [],
        })
        .select();

      if (insertError || !newProgress || newProgress.length === 0) {
        return null;
      }

      return {
        currentDay: newProgress[0].current_day,
        currentCategory: newProgress[0].current_category,
        lastSessionDate: newProgress[0].last_session_date,
        completedSessions: newProgress[0].completed_sessions || [],
      };
    }

    return {
      currentDay: data[0].current_day,
      currentCategory: data[0].current_category,
      lastSessionDate: data[0].last_session_date,
      completedSessions: data[0].completed_sessions || [],
    };
  }

  static async updateEquationsProgress(progress: any) {
    const { error } = await supabase
      .from('equations_progress')
      .update({
        current_day: progress.currentDay,
        current_category: progress.currentCategory,
        last_session_date: progress.lastSessionDate,
        completed_sessions: progress.completedSessions,
      })
      .eq('id', 1);

    if (error) {
      console.error('Error updating equations progress in Supabase:', error);
    }
  }

  // Equations Session Completions
  static async getEquationsSessionCompletions() {
    const { data, error } = await supabase
      .from('equations_session_completions')
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching equations session completions from Supabase:', error);
      return [];
    }

    return data.map((item) => ({
      session: item.session_type,
      day: item.day_number,
      category: item.category,
      timestamp: new Date(item.completed_at).getTime(),
    }));
  }

  static async saveEquationsSessionCompletion(completionData: any) {
    const { error } = await supabase.from('equations_session_completions').insert({
      session_type: completionData.session,
      day_number: completionData.day,
      category: completionData.category,
      completed_at: new Date(completionData.timestamp || Date.now()).toISOString(),
    });

    if (error) {
      console.error('Error saving equations session completion to Supabase:', error);
    }
  }

  // Drawing Presentations
  static async getDrawingPresentations() {
    const { data, error } = await supabase
      .from('drawing_presentations')
      .select('*')
      .order('presented_at', { ascending: false });

    if (error) {
      console.error('Error fetching drawing presentations from Supabase:', error);
      return [];
    }

    return data.map((item) => ({
      setTitle: item.set_title,
      timestamp: new Date(item.presented_at).getTime(),
    }));
  }

  static async saveDrawingPresentation(presentations: any[]) {
    const lastPresentation = presentations[presentations.length - 1];
    if (!lastPresentation) return;

    const { error } = await supabase.from('drawing_presentations').insert({
      set_title: lastPresentation.setTitle,
      presented_at: new Date(lastPresentation.timestamp).toISOString(),
    });

    if (error) {
      console.error('Error saving drawing presentation to Supabase:', error);
    }
  }
}
