# Load required libraries
library(shiny)
library(shinythemes)
library(shinyjs)
library(openai)

# Define the UI
ui <- fluidPage(
  useShinyjs(),

  # Add custom JavaScript function to resize the textarea
  tags$head(
    tags$script(HTML("
    function resizeTextarea(textareaId) {
      var textarea = document.getElementById(textareaId);
      textarea.style.height = 'auto';
      textarea.style.height = (textarea.scrollHeight) + 'px';
    }
  ")),
    # Include the .png favicon
    tags$link(rel = "icon", href = "ADSS_Mini_Logo_2.png", type = "image/png")
  ),
  
  theme = shinytheme("darkly"),
  
  tags$head(
    tags$style(HTML("
      .output-container {
        width: 50%;
      }
    "))
  ),
  
  titlePanel(
    title = div(style = "text-align: center;",
                div("VoiceLingo", style = "font-size: 40px;"),
                div("AI-Powered Audio Transcription & Translation", style = "font-size: 26px;"),
                div(
                  "Powered by ",
                  a("OpenAI's Whisper ASR System", href = "https://openai.com/research/whisper", target = "_blank"),
                  style = "font-size: 20px;"
                )
    ),
    windowTitle = NULL
  ),
  
  fluidRow(
    column(width = 12, align = "center",
           passwordInput("api_key", "Enter your OpenAI API Key:", ""),
           br(),
           fileInput(inputId = "audio_file"
                     , multiple = FALSE
                     , label = paste("Upload Audio File to Transripe/Translate (Up to 25MB):")
                     , placeholder = c("mp3, mp4, mpeg, m4a, wav, webm")
                     , accept = c(".mp3", ".mp4", ".mpeg", ".m4a", ".wav", ".webm")),
           tags$hr(),
           
           fluidRow(
             column(5, align = "center", offset = 1, 
                    # h3("Transcription:"),
                    actionButton("transcripe", "Transcripe"
                                 , style = "background-color: #7d1fc4; color: white; font-size: 18px; padding: 10px 20px;"),
                    br(),
                    br(),
                    tags$textarea(id = "transcription"
                                  , oninput = "resizeTextarea(this);" 
                                  , placeholder = "Transcriped text will appear here"
                                  , rows = 15
                                  , style = "width: 100%; background-color: #1f2130; color: white; font-size: 16px; resize: none; border: 1px solid #1f2130;"),
                    br(),
                    downloadButton("download_transcription", "Download Transcription")
                    ), 
             column(5, align = "center",
                    # h3("Translation:"),
                    actionButton("translate", "Translate"
                                 , style = "background-color: #7d1fc4; color: white; font-size: 18px; padding: 10px 20px;"),
                    br(),
                    br(),
                    tags$textarea(id = "translation"
                                  , oninput = "resizeTextarea(this);" 
                                  , placeholder = "Translated text will appear here"
                                  , rows = 15
                                  , style = "width: 100%; background-color: #1f2130; color: white; font-size: 16px; resize: none; border: 1px solid #1f2130;"),
                    br(),
                    downloadButton("download_translation", "Download Translation")
               
             )
           )
    )
  ),
  
  div(style = "text-align: right; margin-bottom: 10px; margin-top: 20px; margin-right: 30px;",
      a(href = "https://www.analyticadss.com", target = "_blank",
        img(src = "ADSS_Logo.png", width = "200px", height = "50px", style = "display: inline-block;")
      )
  )
)

# Define the server
server <- function(input, output, session) {
  
  observeEvent(input$transcripe, {
    req(input$api_key, input$audio_file)
    
    # Process the audio input using OpenAI Whisper model
    transcription <- create_transcription(
      file = input$audio_file$datapath,
      model = "whisper-1",
      openai_api_key = input$api_key
    )
    
    # Display the results
    transcription <- transcription$text
    updateTextAreaInput(session, "transcription", value = transcription)
  })
  
  observeEvent(input$translate, {
    req(input$api_key, input$audio_file)
    
    # Process the translation using OpenAI Whisper model
    translation <- create_translation(
      file = input$audio_file$datapath,
      model = "whisper-1",
      openai_api_key = input$api_key
    )
    
    # Display the results
    translation <- translation$text
    updateTextAreaInput(session, "translation", value = translation)
  })
  
  # Download handlers for transcription and translation
  output$download_transcription <- downloadHandler(
    filename = function() {
      paste0("transcription_", Sys.Date(), ".txt")
    },
    content = function(file) {
      writeLines(transcription$text, file)
    }
  )
  
  output$download_translation <- downloadHandler(
    filename = function() {
      paste0("translation_", Sys.Date(), ".txt")
    },
    content = function(file) {
      writeLines(translation$text, file)
    }
  )
}

# Run the app with the max file size limit set to 25 MB
shinyApp(ui = ui, server = server, options = list(maxRequestSize = 25 * 1024^2))
