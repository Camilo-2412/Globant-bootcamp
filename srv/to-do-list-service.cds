using todolist as todo from '../db/schema';

service ToDoService {
    entity Users as projection on todo.Users;
    entity Projects as projection on todo.Projects;
    entity Tasks as projection on todo.Tasks;
    entity Comments as projection on todo.Comments;
    entity Tags as projection on todo.Tags;
}
