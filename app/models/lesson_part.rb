class LessonPart < ApplicationRecord
  belongs_to :lesson
  has_many_attached :files

  enum section_type: {
    warm_up: 0,
    bridge_activity: 1,
    main_activity: 2,
    end_of_lesson: 3,
    script: 4
  }

  def file_infos
    files.map do |file|
      {
        url: Rails.application.routes.url_helpers.rails_blob_url(file, only_path: true),
        filename: file.filename.to_s
      }
    end
  end
end
