from flask import Flask,render_template,url_for,request
import csv,os
from flask_mail import Mail, Message
app = Flask(__name__)
mail = Mail(app)
app.config['MAIL_SERVER']='smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'prasanthkanakala481@gmail.com'
app.config['MAIL_PASSWORD'] = 'Prasanth@313'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)
@app.route('/',methods=['GET','POST'])
def index():
    return render_template('index.html')

@app.route('/data',methods=['GET','POST'])
def data():
    if request.method == "POST":
        print(request.form)
        data = "hello"
        data = []
        master =csv.reader(request.files.get('master').read().decode('utf-8').splitlines())
        response = csv.reader(request.files.get('response').read().decode('utf-8').splitlines())
        for row in master:
            data.append(list(row))
        return render_template("data.html",data=data)

@app.route('/concisemarks',methods=['GET','POST'])
def concisemarks():
    if request.method=='POST':
        return "Generated"

@app.route('/sendemail',methods=['GET','POST'])
def send_email():
    files = os.listdir('sample_output\marksheet')
    print(files)
   
    for file in files :
        msg = Message('Hello',sender ='prasanthkanakala481@gmail.com',recipients = ['prasanthkanakala75@gmail.com','puligachakri@gmail.com'])
        msg.body = 'Hello Flask message sent from Flask-Mail'
        with app.open_resource(f"./sample_output/marksheet/{file}") as fp:  
            msg.attach(f"{file}", "application/xlsx", fp.read()) 
            mail.send(msg)
            print(f"Success mail sent{file}")
    return 'Sent Email successfully'   
if __name__ == "__main__":
    app.run(debug=True)