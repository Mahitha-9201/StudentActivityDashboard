class Student:
    def __init__(self, user_id, name):
        self.user_id = user_id
        self.name = name
        
    def to_dict(self):
        return {
            "id": self.user_id,
            "name": self.name
        }