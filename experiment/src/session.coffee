###
session.coffee
Fred Callaway

Demonstrates the mouselab-mdp jspsych plugin

###
# coffeelint: disable=max_line_length, indentation

# Enforce a minimum window size
checkWindowSize = (width, height, display) ->
  window.MouselabMDPCtx?.DEBUG_MODE && console.log 'cws'
  win_width = $(window).width()
  maxHeight = $(window).height()
  if $(window).width() < width or $(window).height() < height
    display.hide()
    $('#window_error').show()
  else
    $('#window_error').hide()
    display.show()

$(window).resize -> checkWindowSize 800, 600, $('#jspsych-target')
$(window).resize()



loadJson = (file, callback) ->
  $.ajax
    dataType: 'json'
    url: file
    success: (data) -> callback(data)
    error: (jqXHR, status, err) ->
      $('#jspsych-target').html """
        <h1>Error</h1>
        <p>Failed to load experiment data. Please refresh the page or contact the researcher if the problem persists.</p>
      """

$(window).on 'load', ->
  loadJson "static/json/trials.json", (trials) ->
    startSession trials

startSession = (trials) ->
  window.MouselabMDPCtx?.DEBUG_MODE && console.log 'START SESSION'
  window.MouselabMDPCtx?.DEBUG_MODE && console.log trials

  #  ============================== #
  #  ====== TRIAL DEFINITION ====== #
  #  ============================== #

  welcome =
    type: 'text'
    text: """
    <h1>Mouselab-MDP Demo</h1>

    This is a demonstration of the Mouselab-MDP plugin.
    <p>
    Press <b>space</b> to continue.

    """

  i = 0
  main =
    type: 'mouselab-mdp'
    leftMessage: -> "Round: #{++i}/#{trials.length}"
    timeline: trials

  timeline = [
    # welcome
    main
  ]


  # ================================================ #
  # ========= START AND END THE SESSION ============ #
  # ================================================ #


  jsPsych.init
    display_element: $('#jspsych-target')
    timeline: timeline
    # show_progress_bar: true

    on_finish: ->
      jsPsych.data.displayData()

    on_data_update: (data) ->
      window.MouselabMDPCtx?.DEBUG_MODE && console.log 'data', data

