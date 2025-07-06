# app/models/lesson_part.rb
class LessonPart < ApplicationRecord
  has_and_belongs_to_many :lessons
  has_many_attached :files

  enum section_type: {
    warm_up: 0,
    bridge_activity: 1,
    main_activity: 2,
    end_of_lesson: 3,
    script: 4
  }

  AGE_GROUPS = ['Young', 'Middle', 'Older', 'All'].freeze
  LEVELS = [
    'Toe Tipper',
    'Green Horn',
    'Semi-Pro',
    'Seasoned Veteran(all)'
  ].freeze

  validates :age_group, inclusion: { in: AGE_GROUPS, allow_blank: true }
  validates :level, inclusion: { in: LEVELS, allow_blank: true }

  def file_infos
    files.map do |file|
      {
        url: Rails.application.routes.url_helpers.rails_blob_url(file, only_path: true),
        filename: file.filename.to_s
      }
    end
  end
end
