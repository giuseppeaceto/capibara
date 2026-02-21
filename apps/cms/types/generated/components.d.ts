import type { Schema, Struct } from '@strapi/strapi';

export interface CourseQuizQuestion extends Struct.ComponentSchema {
  collectionName: 'components_course_quiz_questions';
  info: {
    description: 'Domanda a risposta multipla per i quiz dei corsi';
    displayName: 'QuizQuestion';
  };
  attributes: {
    correctAnswer: Schema.Attribute.Enumeration<['A', 'B', 'C', 'D']> &
      Schema.Attribute.Required;
    explanation: Schema.Attribute.Text;
    optionA: Schema.Attribute.String & Schema.Attribute.Required;
    optionB: Schema.Attribute.String & Schema.Attribute.Required;
    optionC: Schema.Attribute.String;
    optionD: Schema.Attribute.String;
    question: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SharedLinkItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_link_items';
  info: {
    description: '';
    displayName: 'Link Item';
    icon: 'link';
  };
  attributes: {
    description: Schema.Attribute.Text;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    publishDate: Schema.Attribute.DateTime;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Componente SEO per ottimizzazione motori di ricerca';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    keywords: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    preventIndexing: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    structuredData: Schema.Attribute.JSON;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'course.quiz-question': CourseQuizQuestion;
      'shared.link-item': SharedLinkItem;
      'shared.seo': SharedSeo;
    }
  }
}
