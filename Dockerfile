FROM python:3.9.13

RUN apt-get update && \
    apt-get install -y openjdk-11-jdk && \
    apt-get clean;
ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64

WORKDIR /app
COPY . /app
RUN pip install -r requirements.txt
EXPOSE 5000
CMD python ./main.py