import { createClient } from '@supabase/supabase-js';
import { isToday } from 'date-fns';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseService {
  // Settings
  static async getSettings() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) {
      console.error('Error fetching settings from Supabase:', error);
      return null;
    }
    
    return {
      reading: {
        noRep: {
          words: data.reading_no_rep_words,
          sentences: data.reading_no_rep_sentences,
        },
        interval: {
          words: data.reading_interval_words,
          sentences: data.reading_interval_sentences,
        },
        books: {
          allowAllBooks: data.reading_allow_all_books,
        }
      },
      drawings: {
        showCaptions: data.drawings_show_captions,
        interval: data.drawings_interval,
      }
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
        drawings_show_captions: settings.drawings.showCaptions,
        drawings_interval: settings.drawings.interval,
      })
      .eq('id', 1);
    
    if (error) {
      console.error('Error updating settings in Supabase:', error);
    }
  }
  
  // Book Progress
  static async getBookProgress() {
    const { data, error } = await supabase
      .from('book_progress')
      .select('*');
    
    if (error) {
      console.error('Error fetching book progress from Supabase:', error);
      return [];
    }
    
    return data.map(item => ({
      bookId: item.book_id,
      completedWordTriples: item.completed_word_triples || [],
      completedSentenceTriples: item.completed_sentence_triples || [],
      isCompleted: item.is_completed,
    }));
  }
  
  static async updateBookProgress(bookProgress: any[]) {
    for (const progress of bookProgress) {
      const { error } = await supabase
        .from('book_progress')
        .upsert({
          book_id: progress.bookId,
          completed_word_triples: progress.completedWordTriples,
          completed_sentence_triples: progress.completedSentenceTriples,
          is_completed: progress.isCompleted,
        }, {
          onConflict: 'book_id'
        });
      
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
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching daily plan from Supabase:', error);
      return null;
    }
    
    if (!data || !isToday(new Date(data.created_at))) {
      return null;
    }
    
    return {
      timestamp: new Date(data.created_at).getTime(),
      bookId: data.book_id,
      selectedWordTripleIndex: data.selected_word_triple_index,
      selectedSentenceTripleIndex: data.selected_sentence_triple_index,
      sessions: {
        session1: data.session1_content,
        session2: data.session2_content,
        session3: data.session3_content,
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
    
    return data.map(item => ({
      session: item.session_name,
      type: item.content_type,
      timestamp: new Date(item.completed_at).getTime(),
    }));
  }
  
  static async saveBookTrackSession(sessions: any[]) {
    const lastSession = sessions[sessions.length - 1];
    if (!lastSession) return;
    
    const { error } = await supabase
      .from('book_track_sessions')
      .insert({
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
    const { data, error } = await supabase
      .from('no_rep_progress')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching no-rep progress from Supabase:', error);
      return [];
    }
    
    return data?.displayed_items || [];
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
    
    return data.map(item => new Date(item.completed_at).getTime());
  }
  
  static async saveNoRepCompletion(contentType: 'words' | 'sentences') {
    const { error } = await supabase
      .from('no_rep_completions')
      .insert({
        content_type: contentType,
      });
    
    if (error) {
      console.error('Error saving no-rep completion to Supabase:', error);
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
    
    return data.map(item => ({
      setTitle: item.set_title,
      timestamp: new Date(item.presented_at).getTime(),
    }));
  }
  
  static async saveDrawingPresentation(presentations: any[]) {
    const lastPresentation = presentations[presentations.length - 1];
    if (!lastPresentation) return;
    
    const { error } = await supabase
      .from('drawing_presentations')
      .insert({
        set_title: lastPresentation.setTitle,
        presented_at: new Date(lastPresentation.timestamp).toISOString(),
      });
    
    if (error) {
      console.error('Error saving drawing presentation to Supabase:', error);
    }
  }
}