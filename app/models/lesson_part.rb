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

  validate :age_groups_are_valid
  validate :levels_are_valid

  def age_groups_are_valid
    return if age_group.blank?
    invalid = Array(age_group) - AGE_GROUPS
    errors.add(:age_group, "contains invalid value(s): #{invalid.join(', ')}") if invalid.any?
  end

  def levels_are_valid
    return if level.blank?
    invalid = Array(level) - LEVELS
    errors.add(:level, "contains invalid value(s): #{invalid.join(', ')}") if invalid.any?
  end

  def file_infos
    files.map do |attachment|
      {
        id:       attachment.id,
        filename: attachment.filename.to_s,
        url:      Rails.application.routes.url_helpers
                   .rails_blob_url(attachment, only_path: true)
      }
    end
  end
end
