"use strict";

class Init {
  constructor() {
    this.sucMes = {};
    this.errMes = {};
    this.comments = [];
    this.add = [];
  }

  /**
   * Начинаем получение инфы из БД с получения сообщений об успехе
   * Вешаем обработчики кликов по кнопкам
   */
  init() {
    this.getSucMes();
    this.sendButtonHandler();
  }

  /**
   * Получаем сообщения об успехе в виде объекта и запускаем метод получения сообщений об ошибках
   */
  getSucMes() {
    $.get('http://localhost:3000/sucMes', {}, obj => {
      this.sucMes = obj;
      this.getErrMes()
    }, 'json')
  }

  /**
   * Получаем сообщения об ошибках в виде объекта и запускаем метод получения массивов новых и одобренных комментариев
   */
  getErrMes() {
    $.get('http://localhost:3000/errMes', {}, obj => {
      this.errMes = obj;
      this.getComments('comments');
      this.getComments('add');
      this.getComments('submit');
      this.getComments('delete');
    }, 'json')
  }

  /**
   * Получаем новые и одобренные комменты и записываем их массивы в свойства add и comments
   */
  getComments(name) {
    $.ajax({
      type: 'GET',
      url: `http://localhost:3000/${name}`,
      dataType: 'json',
      success: obj => {
        this[name] = obj;
        if (name === 'add') {
          this.renderAdd()
        } else {
          this.renderComments(name)
        }
      },
      error: () => {
        alert(this.errMes[`${name}Error`].error_message)
      }
    });
  }

  /**
   * Очищаем див с одобренными отзывами и отрисовываем исходя из полученных из БД
   */
  renderComments(name) {
    $(`div[data-name=${name}]`).empty();
    let $ul = $('<ul />');
    this[name].forEach(item => {
      $ul.append(
        $('<li />', {
          text: item.text,
        })
      )
    });
    $(`div[data-name=${name}]`).append($ul)
  }

  /**
   * Очищаем див с добавленными отзывами и отрисовываем исходя из полученных из БД
   */
  renderAdd() {
    $('div[data-name=add]').empty();
    let $ul = $('<ul />');
    this.add.forEach(item => {
      $ul.append(
        $('<li />', {
          text: item.text,
        }).append(
          $('<button />', {
            text: 'Delete',
            'data-name': 'delete',
            'data-id': item.id,
            'data-id_comment': item.id_user
          }),
          $('<button />', {
            text: 'Submit',
            'data-name': 'submit',
            'data-id': item.id,
            'data-id_comment': item.id_user
          })
        )
      )
    });
    $('div[data-name=add]').append($ul);
    this.submitButtonHandler();
    this.deleteButtonHandler()
  }

  /**
   * Берет текст из поля textarea и отправляет его в БД вместе с id_user через функцию sendComment()
   */
  sendButtonHandler() {
    $('#send').click(event => {
      let text = $('textarea')[0].value;
      this.addComment(text);
      event.preventDefault()
    })
  }

  /**
   * Вешаем на кнопки Submit обработчик клика, по которому запускается метод добавления коммента
   */
  submitButtonHandler() {
    let that = this;
    $('button[data-name=submit]').click(function (event) {
      let dataId = $(this).attr('data-id');
      that.moveCommentInit('submit', dataId);
      event.preventDefault()
    })
  }

  /**
   * Вешаем на кнопки Delete обработчик клика, по которому запускается метод удаления коммента
   */
  deleteButtonHandler() {
    let that = this;
    $('button[data-name=delete]').click(function (event) {
      let dataId = $(this).attr('data-id');
      that.moveCommentInit('delete', dataId);
      event.preventDefault()
    })
  }

  /**
   * Запрашиваем из БД add коммент под соответствующим id и передаем его функции addToComment
   * @param string id комментария в БД add, взятый из параметров кнопки
   */
  moveCommentInit(db, dataId) {
    // получаем из БД add коммент и передаем дальше
    $.ajax({
      type: 'GET',
      url: `http://localhost:3000/add/${dataId}`,
      dataType: 'json',
      success: comment => {
        this.moveComment(db, comment) // добавляем объект коммента без id в БД comments
      },
      error: () => {
        alert(this.errMes.commentsError.error_message)
      }
    });
  }

  /**
   * Одобренный коммент добавляется в БД comments
   * @param {} comment добавленный комментарий
   */
  moveComment(db, comment) {
    let newComment = {
      id_comment: comment.id_user,
      text: comment.text
    };

    $.ajax({
      url: `http://localhost:3000/${db}`,
      type: 'POST',
      dataType: 'json',
      data: newComment,
      success: data => {
        console.log(data);
        this.getComments(db);
        this.removeFromAdd(comment.id);
        console.log(this.sucMes.commonSuccess);
      },
      error: () => {
        console.log(this.errMes[`${db}Error`].error_message);
      }
    })
  }

  /**
   * Удаляем коммент из списка на модерацию
   * @param string id отзыва в массиве add
   */
  removeFromAdd(id) {
    $.ajax({
      type: 'DELETE',
      url: `http://localhost:3000/add/${id}`,
      success: () => {this.getComments('add')}
    })
  }

  /**
   * Формирует объект отзыва и отправляет его в БД в массив добавленных отзывов (add)
   * @param string text принимает текст отзыва
   */
  addComment(text) {
    let comment = {
      id_user: 123,
      text: text
    };

    $.ajax({
      url: 'http://localhost:3000/add',
      type: 'POST',
      dataType: 'json',
      data: comment,
      success: () => {
        this.getComments('add');
        alert(this.sucMes.addSuccess.userMessage);
      },
      error: () => {
        alert(this.errMes.addError.userMessage)
      }
    })
  }
}

(function ($) {
  $(function () {
    let init = new Init();
    init.init();
  })
})(jQuery);