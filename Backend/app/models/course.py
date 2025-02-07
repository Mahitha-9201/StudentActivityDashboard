class Course:
    def __init__(self, course_id, name):
        self.course_id = course_id
        self.name = name

    def to_dict(self):
        return {
            "course_id": self.course_id,
            "name": self.name
        }