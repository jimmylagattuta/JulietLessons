class LessonPart < ApplicationRecord
  belongs_to :lesson
  has_one_attached :file

  enum section_type: {
    warm_up: 0,
    bridge_activity: 1,
    main_activity: 2,
    end_of_lesson: 3,
    script: 4
  }
end