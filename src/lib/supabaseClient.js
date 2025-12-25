
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Progress service functions
export const progressService = {
  // Load progress for a student
  async loadProgress(studentName) {
    if (!studentName) return null;

    const { data, error } = await supabase
      .from('student_progress')
      .select('progress')
      .eq('student_name', studentName.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading progress:', error);
      return null;
    }

    return data?.progress || {};
  },

  // Save progress for a student
  async saveProgress(studentName, progress) {
    if (!studentName) return false;

    const normalizedName = studentName.toLowerCase().trim();

    const { error } = await supabase
      .from('student_progress')
      .upsert({
        student_name: normalizedName,
        progress: progress
      }, {
        onConflict: 'student_name'
      });

    if (error) {
      console.error('Error saving progress:', error);
      return false;
    }

    return true;
  }
};
