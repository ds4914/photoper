from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Home route
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/event-details')
def event_details():
    # Extract the eventId from the query parameters
    event_id = request.args.get('eventId')
    if not event_id:
        return "Event ID is missing.", 400

    # Pass the eventId to the template
    return render_template('event-details.html', eventId=event_id)

@app.route('/create-event')
def create_event():
    return render_template('create-event.html')


@app.route('/selected-images')
def selected_images():
    event_id = request.args.get('eventId')
    password = request.args.get('password')
    return render_template('selected-images.html', eventId=event_id, password=password)


# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        # Here, add your logic for validating the login
        return redirect(url_for('home'))  # redirect to home if login is successful
    return render_template('login.html')

# Signup route
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        return redirect(url_for('login'))  # redirect to login after signup
    return render_template('signup.html')

if __name__ == '__main__':
    app.run(debug=True)
