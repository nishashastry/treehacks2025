from openai import OpenAI
client = OpenAI()
PATH = "test_audio_files\doctor_visit1.mp3"

# possibly include prompt to enhance quality of transcription
def transcription(audio_path) :

    audio_file= open(audio_path, "rb")
    transcription = client.audio.transcriptions.create(
        model="whisper-1", 
        file=audio_file
    )
    return transcription.text
def action_items(transcipt):
    prompt = "You are going to get an audio transcript of a doctor's visit for diabetes.In the audio transcript, there is audio of both the doctor and patient. you are basically a medically educated scribe assistant for the doctor. the patient wants a summary and a list of action items based on the doctor's visits."
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "developer", "content": prompt},
            {
                "role": "user",
                "content": "Reccomend action items for this visit: " + str(transcipt)
            }
        ]
    )
    return (completion.choices[0].message.content)

transcript_visit = (transcription(PATH))
actions = action_items(transcript_visit)
print(actions)