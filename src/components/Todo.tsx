import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { remove, updatingData } from '../api/todos';
import { Todo } from '../types/Todo';

interface Props {
  completed: boolean,
  title: string;
  id: number;
  setError: (value: string) => void,
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>,
  todos: Todo[],
  setSelectedTodoId: (value: number) => void,
  selectedTodoId: number | null,
}

export const TodoInfo: React.FC<Props> = ({
  completed,
  title,
  id,
  setTodos,
  setError,
  todos,
  setSelectedTodoId,
  selectedTodoId,
}) => {
  const [isDoubleClick, setIsDoubleClick] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const removeTodo = (removeId: number) => {
    setSelectedTodoId(removeId);
    const fetchData = async () => {
      try {
        await remove(removeId);

        setTodos((state: Todo[]) => [...state]
          .filter(todo => todo.id !== removeId));
      } catch (errorFromServer) {
        setError('Unable to delete a todo');
      } finally {
        setSelectedTodoId(0);
      }
    };

    fetchData();
  };

  const handlerCheck = (updateId: number) => {
    setSelectedTodoId(updateId);
    const fetchData = async () => {
      try {
        const currentTodo = todos.find(todo => todo.id === updateId);
        const upDate = await updatingData(updateId,
          { completed: !currentTodo?.completed });

        setTodos((state: Todo[]) => [...state].map(todo => {
          if (todo.id === updateId) {
            return ({
              ...upDate,
            });
          }

          return todo;
        }));
      } catch (errorFromServer) {
        setError('Unable to update a todo');
      } finally {
        setSelectedTodoId(0);
      }
    };

    fetchData();
  };

  const handlerInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(event.target.value);
  };

  const escFunction = useCallback((
    event: KeyboardEvent,
  ) => {
    if (event.key === 'Escape') {
      setIsDoubleClick(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', escFunction, false);

    return () => {
      document.removeEventListener('keydown', escFunction, false);
    };
  }, [escFunction]);

  const saveData = () => {
    if (newTitle.trim().length === 0) {
      removeTodo(id);
    } else {
      setSelectedTodoId(id);
      const fetchData = async () => {
        try {
          const upDate = await updatingData(id, { title: newTitle });

          setTodos((state: Todo[]) => [...state].map(todo => {
            if (todo.id === id) {
              return ({
                ...upDate,
              });
            }

            return todo;
          }));
        } catch (errorFromServer) {
          setError('Unable to update a todo');
        } finally {
          setSelectedTodoId(0);
          setIsDoubleClick(false);
        }
      };

      fetchData();
    }
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    saveData();
  };

  return (
    <div
      data-cy="Todo"
      className={classNames(
        'todo',
        {
          completed,
        },
      )}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={completed}
          onChange={() => handlerCheck(id)}
        />
      </label>

      {isDoubleClick && (
        <form
          onSubmit={onSubmit}
        >
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            value={newTitle}
            onChange={handlerInput}
            onBlur={saveData}
            onKeyDown={() => escFunction}
          />
        </form>
      )}

      {!isDoubleClick && (
        <span
          data-cy="TodoTitle"
          className="todo__title"
          onDoubleClick={() => setIsDoubleClick(true)}
        >
          {title}
        </span>
      )}
      {!isDoubleClick && (
        <button
          type="button"
          className="todo__remove"
          data-cy="TodoDeleteButton"
          onClick={() => removeTodo(id)}
        >
          ×
        </button>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay',
          {
            'is-active': selectedTodoId === id,
          })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};