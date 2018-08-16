"use strict";

let DTO = [
  {
    id: 'name',
    reg: /[\D]\w+/,
    mes: 'Имя латинскими буквами',
  },
  {
    id: 'phone',
    reg: /\+7\(\d{3}\)\d{3}-\d{4}/,
    mes: 'Телефон вида +7(000)000-0000'
  },
  {
    id: 'email',
    reg: /\w+@[a-zA-Z]+?\.[a-zA-Z]{2,6}/,
    allowed: /[^-.@]/, //допустимые символы в емайле
    mes: 'Введите корретный email'
  },
  {
    id: 'text',
    reg: /.+/,
    mes: 'Введите ваше сообщение'
  },
];

/**
 * Родительский конструктор для инпутов
 */
class FieldHandler {
  constructor(id, pattern, errorMessage) {
    this.id = id;
    this.pattern = pattern;
    this.errorMessage = errorMessage;
    this.el = {};
    this.isCheckOk = false
  }

  /**
   * На инпуты вешаем обработчки клика - чтобы по клику в поле оно устанавливалось в начальное положение
   */
  addEventListener() {
    this.el.addEventListener('click', () => this.clearField()
    )
  }

  /**
   * Функция получает элемент по id
   * @param {string} id элемента в коде HTML
   */
  getEl() {
    this.el = document.getElementById(this.id);
  }

  /**
   * Проверяет заполнен ли input и соответствует ли заданному шаблону
   * @returns {boolean} - true, если поле заполнено и прошло проверку по шаблону
   */
  check() {
    if (this.el.value !== '') {
      this.isCheckOk = new RegExp(this.pattern).test(this.el.value)
    } else {
      this.isCheckOk = false
    }
  }

  /**
   * Метод очищает input, делает рамку красной и выводит в плейсхолдере ошибку
   * ИЛИ выделяет зеленым рамку, если все ОК
   */
  changeField() {
    if (!this.isCheckOk) {
      this.el.value = ''; // очистить поле
      this.el.placeholder = this.errorMessage; // написать в плейсхолдере ошибку
      this.el.classList.remove('ok');
      this.el.classList.add('error'); // сделать рамку красной
      $('.error').effect('bounce', {times: 2, distance: 5}, 'fast');
      this.dialog('Посмотрите подсказки в полях формы, чтобы заполнить их правильно')
    } else {
      this.el.classList.add('ok') // если проверка поля успешна - сделать рамку зеленой
    }
  }

  /**
   * Вызов модального окна диалога
   */
  dialog(text) {
    $('#dialog').text(text);
    $('#dialog').dialog({
      title: 'Ошибочка вышла😜',
      closeText: "hide",
      draggable: true,
      modal: true,
      hide: { effect: 'explode', duration: 400 },
      buttons: [
        {
          text: 'OK 👌🏽',
          click: function () {
            $(this).dialog('close');
          }
        }
      ]
    });
  }

  /**
   * Очистка поля: если поле содержит ошибку - очищает поле и убирает выделение ошибки
   */
  clearField() {
    if (this.el.classList.contains('error')) {
      this.el.value = ''; // очищаем поле
      this.el.setAttribute('class', '')
    }
  }
}

/**
 * Дочерний класс для проверки поля email
 */
class EmailHandler extends FieldHandler {
  constructor(id, pattern, allowed, errorMessage) {
    super(id, pattern, errorMessage);
    this.allowed = allowed
  }

  /**
   * Проверяет поле емайла не только по шаблону, но и на наличие недопустимых символов
   */
  check() {
    if (this.pattern.test(this.el.value)) { // проверяем, есть ли в поле что-то похожее на емайл
      let nonLiteralsArr = this.el.value.match(/\W/g).join(''); // находим все нелитералы и объединяем их в строку
      this.isCheckOk = !this.allowed.test(nonLiteralsArr); // проверяем email на наличие недопустимых символов
    } else {
      this.isCheckOk = false
    }
  }
}

/**
 * Дочерний класс для кнопки - содержит обработку клика по кнопке
 */
class Init {
  constructor() {
    this.fields = [];
    this.cityList = [];
    this.button = document.getElementById('submit');
  }

  init() {
    // создаем объекты полей и вешаем на них обработчик клика
    for (let i = 0; i < DTO.length; i++) {
      if (DTO[i].id === 'email') {
        this.fields.push(new EmailHandler(DTO[i].id, DTO[i].reg, DTO[i].allowed, DTO[i].mes));
      } else {
        this.fields.push(new FieldHandler(DTO[i].id, DTO[i].reg, DTO[i].mes));
      }
      this.fields[i].getEl();
      this.fields[i].addEventListener('click', () => this.fields[i].clearField());
    }

    this.setCityList(); // получить и записать массив с городами
    this.cityTypeHandler(); // обработка клика по полю выбора города
    this.buttonHandler(); // запускаем обработчкик кнопки
    this.date() // запускаем метод вызова дата-пикера
  }

  /**
   * Вызов модального окна диалога
   */
  dialog() {
    $('#dialog').dialog({
      title: 'Ошибочка вышла😜',
      text: 'Посмотрите подсказки в полях формы, чтобы заполнить их правильно',
      draggable: true,
      modal: true,
      show: { effect: 'blind', duration: 800 },
      hide: { effect: 'explode', duration: 1000 },
      buttons: [
        {
          text: 'OK',
          icon: 'ui-icon-heart',
          click: function () {
            $(this).dialog('close');
          }
        }
      ]
    });
  }

  /**
   * Устанавливаем для инпута даты датапикер
   */
  date() {
    $('#date').datepicker({
      changeMonth: true,
      changeYear: true,
      dateFormat: "dd.mm.yy",
      firstDay: 1,
      monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
      monthNamesShort: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
      dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
      nextText: "Вперед",
      prevText: "Назад",
      buttonText: "Выбрать",
      yearRange: "c-90:c"
    })
  }

  /**
   * Обрабатывает клик по кнопке и запускает проверку полей
   * Получает новое значение поля и проверяет его
   */
  buttonHandler() {
    this.button.addEventListener('click', event => {
      for (let i = 0; i < this.fields.length; i++) {
        this.fields[i].el.setAttribute('class', '');
        this.fields[i].getEl(); //получаем получаем элемент поля с имеющимся val внутри
        this.fields[i].check(); // проверяем заполнение поля по шаблону
        this.fields[i].changeField() // выводим ошибку или ОК
      }
      event.preventDefault(); // отменяем сработку submit
    })
  }

  /**
   * Получаем список городов и записываем массив в свойство cityList
   */
  setCityList() {
    let that = this;
    $(function () {
      $.ajax({
        url: 'http://localhost:3333/city',
        type: 'GET',
        dataType: 'json',
        success: data => {
          for (let i = 0; i < data.length; i++) {
            that.cityList.push(data[i].city);
          }
        },
        error: () => {
          that.dialog()
        }
      })
    })
  }

  /**
   * Записываем все города в значения option у datalist на странице HTML
   */
  appendCityList(updCityList) {
    for (let i = 0; i < updCityList.length; i++) {
      $('#cityList').append('<option value="' + updCityList[i] + '">');
    }
  }

  /**
   * При наборе 3 символов функция составляет обновленный массив updCityList из городов, начинающихся с введенных букв
   * Передает обновленный список городов updCityList методу appendCityList() добавления городов в DOM
   * При уменьшении в инпуте числа символов менее 3 - список городов из DOM удаляется
   */
  cityTypeHandler() {
    $('form:eq(0)').on('input', '#cityField', () => {

      let val = $('#cityField')[0].value;
      let updCityList = [];

      if (val.length === 3 && $('#cityList').html() === '') {
        for (let i = 0; i < this.cityList.length; i++) {
          if (this.isCityBeginsFrom(val, this.cityList[i])) {
            updCityList.push(this.cityList[i])
          }
        }
        this.appendCityList(updCityList);
      } else if (val.length < 3 && $('#cityList').html() !== '') {
        $('#cityList').html('')
      }
    })
  }

  /**
   * Проверят начинается ли город с val
   * @param string val паттерн для регулярного выражения
   * @param string city город, который проверяем по регулярному выражению
   * @returns {boolean}
   */
  isCityBeginsFrom(val, city) {
    return new RegExp('^' + val, 'i').test(city);
  }
}

(function ($) {
  $(function () {
    let init = new Init();
    init.init();
  })
})(jQuery);