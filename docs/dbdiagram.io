// =============================================
// SKEMA BASIS DATA MEDIA PEMBELAJARAN
// Gim Android - Media & Jaringan Telekomunikasi
// =============================================

Table schools {
  id serial [pk]
  name varchar [not null]
  is_hidden boolean [not null, default: false]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]
}

Table users {
  id text [pk]
  fullname varchar [not null]
  email text [not null, unique]
  email_verified boolean [not null, default: false]
  image text
  role text
  school_id integer [ref: > schools.id]
  gender boolean
  grade varchar
  bio text
  has_taken_pretest boolean [not null, default: false]
  banned boolean [default: false]
  ban_reason text
  ban_expires timestamp
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]
}

Table sessions {
  id text [pk]
  expires_at timestamp [not null]
  token text [not null, unique]
  ip_address text
  user_agent text
  user_id text [not null, ref: > users.id, note: 'on delete cascade']
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null]

  indexes {
    user_id [name: 'sessions_userId_idx']
  }
}

Table accounts {
  id text [pk]
  account_id text [not null]
  provider_id text [not null]
  user_id text [not null, ref: > users.id, note: 'on delete cascade']
  access_token text
  refresh_token text
  id_token text
  access_token_expires_at timestamp
  refresh_token_expires_at timestamp
  scope text
  password text
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null]

  indexes {
    user_id [name: 'accounts_userId_idx']
  }
}

Table chapters {
  id serial [pk]
  title varchar [not null]
  description text [not null]
  mascot_id integer [not null]
  minimum_score integer [not null, default: 100, note: 'KKM per chapter (1-100)']
  is_hidden boolean [not null, default: false]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]
}

Table quizzes {
  id serial [pk]
  chapter_id integer [ref: > chapters.id, note: 'on delete cascade']
  title varchar [not null]
  level integer [not null]
  difficulty varchar [not null, note: 'enum: easy, medium, hard']
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    (id, level) [unique, name: 'levels_quiz_unique']
  }
}

Table questions {
  id serial [pk]
  type varchar [note: 'enum: pretest, quiz']
  chapter_id integer [ref: > chapters.id, note: 'on delete cascade']
  quiz_id integer [ref: > quizzes.id, note: 'on delete cascade']
  material_id integer [ref: > study_materials.id, note: 'on delete cascade']
  image_link varchar
  description text [not null]
  question text [not null]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    type [name: 'questions_type_idx']
    chapter_id [name: 'questions_chapterId_idx']
    quiz_id [name: 'questions_quizId_idx']
  }
}

Table options {
  id serial [pk]
  question_id integer [not null, ref: > questions.id, note: 'on delete cascade']
  text varchar [not null]
  is_correct boolean [not null]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    question_id [name: 'options_questionId_idx']
  }
}

Table study_materials {
  id serial [pk]
  title varchar [not null]
  image_link varchar
  content text [not null]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]
}

Table submissions {
  id serial [pk]
  user_id text [not null, ref: > users.id, note: 'on delete cascade']
  chapter_id integer [not null, ref: > chapters.id, note: 'on delete cascade']
  quiz_id integer [not null, ref: > quizzes.id, note: 'on delete cascade']
  score integer
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    user_id [name: 'submissions_userId_idx']
    chapter_id [name: 'submissions_chapterId_idx']
    quiz_id [name: 'submissions_quizId_idx']
  }
}

Table pretest_submissions {
  id serial [pk]
  user_id text [not null, ref: > users.id, note: 'on delete cascade']
  question_id integer [not null, ref: > questions.id, note: 'on delete cascade']
  answered_option_id integer [not null, ref: > options.id, note: 'on delete cascade']
  is_correct boolean [not null]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    user_id [name: 'pretest_submissions_userId_idx']
    question_id [name: 'pretest_submissions_questionId_idx']
  }
}

Table achievements {
  id serial [pk]
  slug varchar [not null, unique]
  title varchar [not null]
  description text [not null]
  icon varchar
  rule jsonb [not null, note: 'JSON Logic rule evaluated against user context']
  is_active boolean [not null, default: true]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]
}

Table user_achievements {
  id serial [pk]
  user_id text [not null, ref: > users.id, note: 'on delete cascade']
  achievement_id integer [not null, ref: > achievements.id, note: 'on delete cascade']
  unlocked_at timestamp [not null, default: `now()`]

  indexes {
    user_id [name: 'user_achievements_userId_idx']
    (user_id, achievement_id) [unique, name: 'user_achievement_unique']
  }
}
