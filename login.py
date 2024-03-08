from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

@app.route('/', methods=['GET'])
def login():
    # Display the login form
    return render_template('login.html')

@app.route('/main', methods=['POST'])
def main():
    # Handle the form submission and redirect to the main page
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
