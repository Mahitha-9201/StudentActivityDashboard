# app/__init__.py
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={
        r"/*": {
            "origins": "http://localhost:3000",
            "allow_credentials": True
        }
    })

    # Register all blueprints
    from app.routes.course_routes import course_bp
    from app.routes.activity_routes import activity_bp
    
    app.register_blueprint(course_bp)
    app.register_blueprint(activity_bp)

    @app.after_request
    def after_request(response):
        # Remove any existing CORS headers to prevent duplicates
        response.headers.pop('Access-Control-Allow-Origin', None)
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
        return response

    return app