from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from sqlalchemy import func
import os
import time
from functools import wraps

# 允许的图片文件扩展名
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# 检查文件扩展名是否允许
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:4200"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "expose_headers": ["Authorization"]  # 添加这行以确保前端可以读取Authorization头
    }
})

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@localhost/campus_forum_system'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ ='user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    avatar = db.Column(db.String(200), default='/media/avatar/initial-avatar.jpg')
    role = db.Column(db.String(20), default='user')

class Section(db.Model):
    __tablename__ = 'section'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
class Post(db.Model):
    __tablename__ = 'post'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    content = db.Column(db.Text, nullable=False)
    images = db.Column(db.Text)
    # 扩展Post模型，添加图片字段
# 在现有Post类中添加：
# images = db.Column(db.Text)  # 存储图片路径，多张图片用逗号分隔
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    # 定义外键关联版块表
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'), nullable=False)
    # 定义外键关联用户表
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # 定义与点赞和收藏的关系，设置级联删除
    postlikes = db.relationship('Postlike', backref='post', cascade='all, delete-orphan')
    favorites = db.relationship('Favorite', backref='post', cascade='all, delete-orphan')    
# 评论模型
class Comment(db.Model):
    __tablename__ = 'comment'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # 外键关联
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # 关联关系
    user = db.relationship('User', backref='comments')
    post = db.relationship('Post', backref=db.backref('comments', cascade='all, delete-orphan'))
# 点赞模型
class Postlike(db.Model):
    __tablename__ = 'postlike'
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # 外键关联
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # 唯一约束，防止重复点赞
    __table_args__ = (db.UniqueConstraint('post_id', 'user_id', name='unique_postlike'),)
# 收藏模型
class Favorite(db.Model):
    __tablename__ = 'favorite'
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # 外键关联
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # 唯一约束，防止重复收藏
    __table_args__ = (db.UniqueConstraint('post_id', 'user_id', name='unique_favorite'),)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({'msg': '缺少必要字段'}), 400
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'msg': '用户名或邮箱已存在'}), 409
    user = User(username=username, email=email, password=password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'msg': '注册成功'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'msg': '缺少用户名或密码'}), 400
    user = User.query.filter_by(username=username).first()
    if not user or user.password != password:
        return jsonify({'msg': '用户名或密码错误'}), 401
    return jsonify({'msg': '登录成功', 'user': {'id': user.id, 'username': user.username, 'email': user.email, 'role': user.role}}), 200

 
# 添加测试路由
# 静态文件服务配置
@app.route('/media/<path:filename>')
def serve_media(filename):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.join(current_dir, 'public')
    return send_from_directory(public_dir, filename)

@app.route('/')
def index():
    return "Flask服务器已运行,请访问/api/login进行登录"

# 获取所有板块
@app.route('/api/sections', methods=['GET'])
def get_sections():
    sections = Section.query.all()
    data = [
        {"id": s.id, "name": s.name, "description": s.description, "created_at": s.created_at} for s in sections
    ]
    return jsonify({"msg": "success", "data": data})

# 获取热门板块（根据帖子数量排序，返回前3个）
@app.route('/api/sections/hot', methods=['GET'])
def get_hot_sections():
    # 查询板块及其帖子数量，按帖子数量降序排列，取前3个
    sections_with_post_count = db.session.query(
        Section,
        func.count(Post.id).label('post_count')
    ).outerjoin(Post).group_by(Section.id).order_by(
        func.count(Post.id).desc()
    ).limit(3).all()
    
    data = []
    for section, post_count in sections_with_post_count:
        section_data = {
            "id": section.id,
            "name": section.name,
            "description": section.description,
            "created_at": section.created_at,
            "post_count": post_count
        }
        data.append(section_data)
    
    return jsonify({"msg": "success", "data": data})

# 获取单个板块
@app.route('/api/sections/<int:section_id>', methods=['GET'])
def get_section(section_id):
    section = Section.query.get_or_404(section_id)
    data = {"id": section.id, "name": section.name, "description": section.description, "created_at": section.created_at}
    return jsonify({"msg": "success", "data": data})

# 创建板块
@app.route('/api/sections', methods=['POST'])
def create_section():
    data = request.get_json()
    section = Section(name=data.get('name'), description=data.get('description'))
    db.session.add(section)
    db.session.commit()
    return jsonify({"msg": "板块创建成功", "data": {"id": section.id}}), 201

# 更新板块
@app.route('/api/sections/<int:section_id>', methods=['PUT'])
def update_section(section_id):
    data = request.get_json()
    section = Section.query.get_or_404(section_id)
    section.name = data.get('name', section.name)
    section.description = data.get('description', section.description)
    db.session.commit()
    return jsonify({"msg": "板块更新成功"})

# 删除板块
@app.route('/api/sections/<int:section_id>', methods=['DELETE'])
def delete_section(section_id):
    section = Section.query.get_or_404(section_id)
    db.session.delete(section)
    db.session.commit()
    return jsonify({"msg": "板块删除成功"})

# 获取所有帖子
@app.route('/api/posts', methods=['GET'])
def get_all_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    data = []
    
    for p in posts:
        user = User.query.get(p.user_id)
        section = Section.query.get(p.section_id)
        
        # 处理图片路径
        images = []
        if p.images:
            images = p.images.split(',')
            
        post_data = {
            "id": p.id, 
            "title": p.title, 
            "content": p.content, 
            "images": images,
            "created_at": p.created_at, 
            "updated_at": p.updated_at, 
            "user_id": p.user_id,
            "section_id": p.section_id,
            "user": {
                "id": user.id,
                "username": user.username,
                "avatar": user.avatar
            },
            "section": {
                "id": section.id,
                "name": section.name
            }
        }
        data.append(post_data)
        
    return jsonify({"msg": "success", "data": data})

# 获取热门帖子（根据点赞数排序，返回前5个）
@app.route('/api/posts/hot', methods=['GET'])
def get_hot_posts():
    # 使用子查询统计每个帖子的点赞数
    from sqlalchemy import func
    
    # 查询帖子及其点赞数，按点赞数降序排列，取前5个
    posts_with_likes = db.session.query(
        Post,
        func.count(Postlike.id).label('like_count')
    ).outerjoin(Postlike).group_by(Post.id).order_by(
        func.count(Postlike.id).desc()
    ).limit(5).all()
    
    data = []
    for post, like_count in posts_with_likes:
        user = User.query.get(post.user_id)
        section = Section.query.get(post.section_id)
        
        # 处理图片路径
        images = []
        if post.images:
            images = post.images.split(',')
            
        post_data = {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "images": images,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "user_id": post.user_id,
            "section_id": post.section_id,
            "like_count": like_count,
            "user": {
                "id": user.id,
                "username": user.username,
                "avatar": user.avatar
            },
            "section": {
                "id": section.id,
                "name": section.name
            }
        }
        data.append(post_data)
    
    return jsonify({"msg": "success", "data": data})

# 获取某板块下所有帖子
@app.route('/api/sections/<int:section_id>/posts', methods=['GET'])
def get_posts_by_section(section_id):
    posts = Post.query.filter_by(section_id=section_id).order_by(Post.created_at.desc()).all()
    data = []
    
    for p in posts:
        user = User.query.get(p.user_id)
        section = Section.query.get(p.section_id)
        
        # 处理图片路径
        images = []
        if p.images:
            images = p.images.split(',')
            
        post_data = {
            "id": p.id, 
            "title": p.title, 
            "content": p.content, 
            "images": images,
            "created_at": p.created_at, 
            "updated_at": p.updated_at, 
            "user_id": p.user_id,
            "section_id": p.section_id,
            "user": {
                "id": user.id,
                "username": user.username,
                "avatar": user.avatar
            },
            "section": {
                "id": section.id,
                "name": section.name
            }
        }
        data.append(post_data)
        
    return jsonify({"msg": "success", "data": data})

# 获取单个帖子
@app.route('/api/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    user = User.query.get(post.user_id)
    section = Section.query.get(post.section_id)
    
    # 处理图片路径
    images = []
    if post.images:
        images = post.images.split(',')
    
    data = {
        "id": post.id, 
        "title": post.title, 
        "content": post.content, 
        "images": images,  # 添加图片数组
        "created_at": post.created_at, 
        "updated_at": post.updated_at, 
        "user_id": post.user_id, 
        "section_id": post.section_id,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar": user.avatar
        },
        "section": {
            "id": section.id,
            "name": section.name,
            "description": section.description,
            "created_at": section.created_at
        }
    }
    return jsonify({"msg": "success", "data": data})

# 创建帖子
@app.route('/api/posts', methods=['POST'])
def create_post():
    # 检查请求类型
    if request.content_type and 'multipart/form-data' in request.content_type:
        # 处理带图片的表单提交
        title = request.form.get('title')
        content = request.form.get('content')
        section_id = request.form.get('section_id')
        user_id = request.form.get('user_id')
        
        if not all([title, content, section_id, user_id]):
            return jsonify({'msg': '请提供完整信息'}), 400
        
        # 处理图片上传
        image_paths = []
        if 'images' in request.files:
            images = request.files.getlist('images')
            for image in images:
                if image and image.filename:
                    filename = secure_filename(image.filename)
                    # 确保目录存在
                    image_dir = os.path.join('public', 'post_images')
                    os.makedirs(image_dir, exist_ok=True)
                    
                    image_path = os.path.join(image_dir, filename)
                    image.save(image_path)
                    image_paths.append(f'/media/post_images/{filename}')
        
        # 创建帖子，图片路径以逗号分隔存储
        post = Post(
            title=title,
            content=content,
            section_id=section_id,
            user_id=user_id,
            images=','.join(image_paths) if image_paths else None
        )
    else:
        # 处理普通JSON提交（向后兼容）
        data = request.get_json()
        title = data.get('title')
        content = data.get('content')
        section_id = data.get('section_id')
        user_id = data.get('user_id')
        
        if not all([title, content, section_id, user_id]):
            return jsonify({'msg': '请提供完整信息'}), 400
        
        post = Post(title=title, content=content, section_id=section_id, user_id=user_id)
    
    db.session.add(post)
    db.session.commit()
    return jsonify({"msg": "帖子创建成功", "data": {"id": post.id}}), 201

# 更新帖子
@app.route('/api/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    post = Post.query.get_or_404(post_id)
    
    # 检查请求类型
    if request.content_type and 'multipart/form-data' in request.content_type:
        # 处理带图片的表单提交
        title = request.form.get('title')
        content = request.form.get('content')
        
        if title:
            post.title = title
        if content:
            post.content = content
            
        # 处理图片上传
        images = request.files.getlist('images')
        image_paths = []
        
        if images:
            for image in images:
                if image and image.filename:
                    filename = secure_filename(image.filename)
                    # 确保目录存在
                    image_dir = os.path.join('public', 'post_images')
                    os.makedirs(image_dir, exist_ok=True)
                    
                    image_path = os.path.join(image_dir, filename)
                    image.save(image_path)
                    image_paths.append(f'/media/post_images/{filename}')
            
            # 更新帖子图片，如果有新图片则替换旧图片
            if image_paths:
                post.images = ','.join(image_paths)
    else:
        # 处理普通JSON提交
        data = request.get_json()
        post.title = data.get('title', post.title)
        post.content = data.get('content', post.content)
    
    db.session.commit()
    return jsonify({"msg": "帖子更新成功"})


def get_current_user():
    token = request.headers.get('Authorization')
    if not token:
        return None
    # 这里假设 token 就是 user_id，实际生产建议用 JWT
    try:
        user_id = int(token)
        return User.query.get(user_id)
    except:
        return None

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'msg': '未登录或token无效'}), 401
        return f(user, *args, **kwargs)
    return decorated_function

# 删除帖子
@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
@login_required
def delete_post(user,post_id):
    post = Post.query.get_or_404(post_id)
    if post.user_id != user.id and user.role != 'admin':
        return jsonify({'msg': '权限不足'}), 403
    db.session.delete(post)
    db.session.commit()
    return jsonify({"msg": "帖子删除成功"})

#修改用户信息
@app.route('/api/profile', methods=['GET'])
@login_required
def get_profile(user):
    return jsonify({
        'username': user.username,
        'email': user.email,
        'avatarUrl': user.avatar
    })
@app.route('/api/profile/update', methods=['POST'])
@login_required
def update_profile(user):
    username = request.form.get('username')
    avatar = request.files.get('avatar')
    if username:
        user.username = username
    if avatar:
        filename = secure_filename(avatar.filename)
        avatar_path = os.path.join('public/avatar', filename)
        avatar.save(avatar_path)
        user.avatar = f'/media/avatar/{filename}'
    db.session.commit()
    return jsonify({'msg': '修改成功'}) 

# 修改密码
@app.route('/api/profile/change-password', methods=['POST'])
@login_required
def change_password(user):
    data = request.get_json()
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')
    
    if not old_password or not new_password:
        return jsonify({'message': '请提供当前密码和新密码'}), 400
    
    # 验证当前密码是否正确
    if user.password != old_password:  # 实际应用中应使用安全的密码哈希比较
        return jsonify({'message': '当前密码不正确'}), 400
    
    # 更新密码
    user.password = new_password
    db.session.commit()
    
    return jsonify({'msg': '密码修改成功'})

# 获取帖子评论
@app.route('/api/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.desc()).all()
    data = []
    for comment in comments:
        data.append({
            'id': comment.id,
            'content': comment.content,
            'created_at': comment.created_at,
            'user': {
                'id': comment.user.id,
                'username': comment.user.username,
                'avatar': comment.user.avatar
            }
        })
    return jsonify({'msg': 'success', 'data': data})

# 发表评论
@app.route('/api/posts/<int:post_id>/comments', methods=['POST'])
@login_required
def create_comment(user, post_id):
    data = request.get_json()
    content = data.get('content')
    if not content:
        return jsonify({'msg': '评论内容不能为空'}), 400
    
    comment = Comment(
        content=content,
        post_id=post_id,
        user_id=user.id
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify({'msg': '评论成功', 'data': {'id': comment.id}}), 201

# 删除评论
@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@login_required
def delete_comment(user, comment_id):
    comment = Comment.query.get_or_404(comment_id)
    if comment.user_id != user.id:
        return jsonify({'msg': '无权限删除此评论'}), 403
    
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'msg': '删除成功'})

# 点赞/取消点赞
@app.route('/api/posts/<int:post_id>/postlike', methods=['POST'])
@login_required
def toggle_postlike(user, post_id):
    existing_postlike = Postlike.query.filter_by(post_id=post_id, user_id=user.id).first()
    
    if existing_postlike:
        # 取消点赞
        db.session.delete(existing_postlike)
        db.session.commit()
        return jsonify({'msg': '取消点赞', 'postliked': False})
    else:
        # 点赞
        postlike = Postlike(post_id=post_id, user_id=user.id)
        db.session.add(postlike)
        db.session.commit()
        return jsonify({'msg': '点赞成功', 'postliked': True})

# 获取帖子点赞数和用户是否已点赞
@app.route('/api/posts/<int:post_id>/postlike-status', methods=['GET'])
@login_required
def get_postlike_status(user, post_id):
    postlike_count = Postlike.query.filter_by(post_id=post_id).count()
    user_postliked = Postlike.query.filter_by(post_id=post_id, user_id=user.id).first() is not None
    
    return jsonify({
        'postlike_count': postlike_count,
        'user_postliked': user_postliked
    })    

# 收藏/取消收藏
@app.route('/api/posts/<int:post_id>/favorite', methods=['POST'])
@login_required
def toggle_favorite(user, post_id):
    existing_favorite = Favorite.query.filter_by(post_id=post_id, user_id=user.id).first()
    
    if existing_favorite:
        # 取消收藏
        db.session.delete(existing_favorite)
        db.session.commit()
        return jsonify({'msg': '取消收藏', 'favorited': False})
    else:
        # 收藏
        favorite = Favorite(post_id=post_id, user_id=user.id)
        db.session.add(favorite)
        db.session.commit()
        return jsonify({'msg': '收藏成功', 'favorited': True})

# 获取用户收藏列表
@app.route('/api/user/favorites', methods=['GET'])
@login_required
def get_user_favorites(user):
    favorites = db.session.query(Favorite, Post).join(Post).filter(Favorite.user_id == user.id).all()
    data = []
    for favorite, post in favorites:
        data.append({
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'created_at': post.created_at,
            'favorited_at': favorite.created_at
        })
    return jsonify({'msg': 'success', 'data': data})

# 获取用户点赞的帖子列表
@app.route('/api/user/liked-posts', methods=['GET'])
@login_required
def get_user_liked_posts(user):
    postlikes = db.session.query(Postlike, Post).join(Post).filter(Postlike.user_id == user.id).all()
    data = []
    for postlike, post in postlikes:
        data.append({
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'created_at': post.created_at,
            'liked_at': postlike.created_at
        })
    return jsonify({'msg': 'success', 'data': data})

# 获取用户发布的帖子列表
@app.route('/api/user/my-posts', methods=['GET'])
@login_required
def get_user_my_posts(user):
    posts = Post.query.filter_by(user_id=user.id).order_by(Post.created_at.desc()).all()
    data = []
    for post in posts:
        # 获取帖子的点赞数
        likes_count = Postlike.query.filter_by(post_id=post.id).count()
        # 获取帖子的评论数
        comments_count = Comment.query.filter_by(post_id=post.id).count()
        
        data.append({
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'created_at': post.created_at,
            'likes_count': likes_count,
            'comments_count': comments_count
        })
    return jsonify({'msg': 'success', 'data': data})

# 获取帖子收藏状态
@app.route('/api/posts/<int:post_id>/favorite-status', methods=['GET'])
@login_required
def get_favorite_status(user, post_id):
    favorite_count = Favorite.query.filter_by(post_id=post_id).count()
    user_favorited = Favorite.query.filter_by(post_id=post_id, user_id=user.id).first() is not None
    
    return jsonify({
        'favorite_count': favorite_count,
        'user_favorited': user_favorited
    })

# 搜索帖子
@app.route('/api/posts/search', methods=['GET'])
def search_posts():
    keyword = request.args.get('keyword', '')
    if not keyword:
        return jsonify({'msg': '请提供搜索关键词', 'data': []}), 400
    
    # 使用 LIKE 进行模糊搜索，同时搜索标题和内容
    posts = Post.query.filter(
        db.or_(
            Post.title.like(f'%{keyword}%'),
            Post.content.like(f'%{keyword}%')
        )
    ).all()
    
    data = []
    for post in posts:
        user = User.query.get(post.user_id)
        
        # 处理图片路径
        images = []
        if post.images:
            images = post.images.split(',')
            
        data.append({
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'images': images,  # 添加图片数组
            'created_at': post.created_at,
            'user': {
                'id': user.id,
                'username': user.username
            }
        })
    
    return jsonify({'msg': 'success', 'data': data})

# 管理员权限检查装饰器
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'msg': '未登录或token无效'}), 401
        if user.role != 'admin':
            return jsonify({'msg': '无管理员权限'}), 403
        return f(user, *args, **kwargs)
    return decorated_function

# ========== 管理员API接口 ==========

# 获取管理员统计数据
@app.route('/api/admin/statistics', methods=['GET'])
@admin_required
def get_admin_statistics(user):
    # 获取用户总数
    total_users = User.query.count()
    
    # 获取今日新增用户数
    today = datetime.now().date()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())
    
    # 注意：这里假设User模型有created_at字段，如果没有，需要添加
    # 由于当前模型没有created_at字段，这里暂时返回0
    new_users_today = 0
    
    # 获取在线用户数（这里简化处理，返回最近30分钟有活动的用户）
    # 注意：这里假设有用户活动记录表，如果没有，需要添加
    # 由于当前没有用户活动记录表，这里暂时返回0
    online_users = 0
    
    # 获取各板块的帖子数量
    section_post_counts = db.session.query(
        Section.id, 
        Section.name, 
        db.func.count(Post.id).label('post_count')
    ).outerjoin(Post, Section.id == Post.section_id)\
    .group_by(Section.id)\
    .all()
    
    section_data = [{
        'id': section_id,
        'name': section_name,
        'post_count': post_count
    } for section_id, section_name, post_count in section_post_counts]
    
    # 获取总帖子数
    total_posts = Post.query.count()
    
    # 获取今日新增帖子数
    new_posts_today = Post.query.filter(
        Post.created_at >= today_start,
        Post.created_at <= today_end
    ).count()
    
    # 获取总评论数
    total_comments = Comment.query.count()
    
    # 获取今日新增评论数
    new_comments_today = Comment.query.filter(
        Comment.created_at >= today_start,
        Comment.created_at <= today_end
    ).count()
    
    return jsonify({
        'msg': 'success', 
        'data': {
            'user_statistics': {
                'total_users': total_users,
                'new_users_today': new_users_today,
                'online_users': online_users
            },
            'post_statistics': {
                'total_posts': total_posts,
                'new_posts_today': new_posts_today
            },
            'comment_statistics': {
                'total_comments': total_comments,
                'new_comments_today': new_comments_today
            },
            'section_statistics': section_data
        }
    })

# 获取所有用户列表
@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users(user):
    users = User.query.all()
    data = [{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'role': u.role,
        'avatar': u.avatar
    } for u in users]
    return jsonify({'msg': 'success', 'data': data})

# 更新用户角色
@app.route('/api/admin/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(current_user, user_id):
    data = request.get_json()
    new_role = data.get('role')
    
    if not new_role or new_role not in ['user', 'admin']:
        return jsonify({'msg': '无效的角色值'}), 400
    
    target_user = User.query.get_or_404(user_id)
    
    # 防止管理员降级自己的权限
    if target_user.id == current_user.id:
        return jsonify({'msg': '不能修改自己的角色'}), 400
    
    target_user.role = new_role
    db.session.commit()
    return jsonify({'msg': '用户角色更新成功'})

# 删除用户
@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(current_user, user_id):
    # 防止管理员删除自己
    if user_id == current_user.id:
        return jsonify({'msg': '不能删除自己的账户'}), 400
    
    target_user = User.query.get_or_404(user_id)
    db.session.delete(target_user)
    db.session.commit()
    return jsonify({'msg': '用户删除成功'})

# 管理员获取所有帖子
@app.route('/api/admin/posts', methods=['GET'])
@admin_required
def admin_get_all_posts(user):
    # 获取查询参数
    section_id = request.args.get('section_id')
    search_term = request.args.get('search')
    
    # 构建查询
    query = Post.query
    
    # 按板块筛选
    if section_id:
        query = query.filter(Post.section_id == section_id)
    
    # 按关键词搜索
    if search_term:
        query = query.filter(
            db.or_(
                Post.title.like(f'%{search_term}%'),
                Post.content.like(f'%{search_term}%')
            )
        )
    
    # 获取结果
    posts = query.order_by(Post.created_at.desc()).all()
    
    data = []
    for post in posts:
        user = User.query.get(post.user_id)
        section = Section.query.get(post.section_id)
        
        # 获取点赞数和评论数
        like_count = Postlike.query.filter_by(post_id=post.id).count()
        comment_count = Comment.query.filter_by(post_id=post.id).count()
        
        # 处理图片路径
        images = []
        if post.images:
            images = post.images.split(',')
        
        data.append({
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'images': images,
            'created_at': post.created_at,
            'updated_at': post.updated_at,
            'like_count': like_count,
            'comment_count': comment_count,
            'user': {
                'id': user.id,
                'username': user.username
            },
            'section': {
                'id': section.id,
                'name': section.name
            }
        })
    
    return jsonify({'msg': 'success', 'data': data})

# 管理员创建板块
@app.route('/api/admin/sections', methods=['POST'])
@admin_required
def admin_create_section(user):
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    
    if not name:
        return jsonify({'msg': '板块名称不能为空'}), 400
    
    # 检查板块名称是否已存在
    existing_section = Section.query.filter_by(name=name).first()
    if existing_section:
        return jsonify({'msg': '板块名称已存在'}), 400
    
    section = Section(name=name, description=description)
    db.session.add(section)
    db.session.commit()
    
    return jsonify({
        'msg': '板块创建成功', 
        'data': {
            'id': section.id,
            'name': section.name,
            'description': section.description,
            'created_at': section.created_at
        }
    }), 201

# 管理员更新板块
@app.route('/api/admin/sections/<int:section_id>', methods=['PUT'])
@admin_required
def admin_update_section(user, section_id):
    section = Section.query.get_or_404(section_id)
    data = request.get_json()
    
    name = data.get('name')
    description = data.get('description')
    
    if name and name != section.name:
        # 检查新名称是否已存在
        existing_section = Section.query.filter_by(name=name).first()
        if existing_section and existing_section.id != section_id:
            return jsonify({'msg': '板块名称已存在'}), 400
        section.name = name
    
    if description is not None:
        section.description = description
    
    db.session.commit()
    
    return jsonify({
        'msg': '板块更新成功',
        'data': {
            'id': section.id,
            'name': section.name,
            'description': section.description,
            'created_at': section.created_at
        }
    })

# 管理员删除板块
@app.route('/api/admin/sections/<int:section_id>', methods=['DELETE'])
@admin_required
def admin_delete_section(user, section_id):
    section = Section.query.get_or_404(section_id)
    
    # 检查板块下是否有帖子
    post_count = Post.query.filter_by(section_id=section_id).count()
    if post_count > 0:
        return jsonify({'msg': f'该板块下有{post_count}个帖子，无法删除'}), 400
    
    db.session.delete(section)
    db.session.commit()
    
    return jsonify({'msg': '板块删除成功'})

# 权限模型
class Permission(db.Model):
    __tablename__ = 'permission'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255))

# 角色模型
class Role(db.Model):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255))

# 角色-权限关联表
role_permission = db.Table('role_permission',
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'), primary_key=True),
    db.Column('permission_id', db.Integer, db.ForeignKey('permission.id'), primary_key=True)
)

# 获取所有角色
@app.route('/api/admin/roles', methods=['GET'])
@admin_required
def get_all_roles(user):
    roles = Role.query.all()
    data = []
    
    for role in roles:
        # 获取角色的权限
        permissions = db.session.query(Permission).join(
            role_permission, Permission.id == role_permission.c.permission_id
        ).filter(role_permission.c.role_id == role.id).all()
        
        permission_data = [{
            'id': p.id,
            'name': p.name,
            'description': p.description
        } for p in permissions]
        
        data.append({
            'id': role.id,
            'name': role.name,
            'description': role.description,
            'permissions': permission_data
        })
    
    return jsonify({'msg': 'success', 'data': data})

# 获取所有权限
@app.route('/api/admin/permissions', methods=['GET'])
@admin_required
def get_all_permissions(user):
    permissions = Permission.query.all()
    data = [{
        'id': p.id,
        'name': p.name,
        'description': p.description
    } for p in permissions]
    
    return jsonify({'msg': 'success', 'data': data})

# 更新角色权限
@app.route('/api/admin/roles/<int:role_id>/permissions', methods=['PUT'])
@admin_required
def update_role_permissions(user, role_id):
    role = Role.query.get_or_404(role_id)
    data = request.get_json()
    permission_ids = data.get('permission_ids', [])
    
    # 验证权限ID是否有效
    for pid in permission_ids:
        try:
            # 确保 pid 是整数
            pid_int = int(pid)
            permission = Permission.query.get(pid_int)
            if not permission:
                return jsonify({'msg': f'权限ID {pid} 不存在'}), 400
        except (ValueError, TypeError):
            return jsonify({'msg': f'无效的权限ID格式: {pid}'}), 400
    
    # 清除现有权限关联
    db.session.execute(role_permission.delete().where(role_permission.c.role_id == role_id))
    
    # 添加新的权限关联
    for pid in permission_ids:
        pid_int = int(pid)  # 确保是整数
        db.session.execute(
            role_permission.insert().values(role_id=role_id, permission_id=pid_int)
        )
    
    db.session.commit()
    
    return jsonify({'msg': '角色权限更新成功'})
    
# 确保上传目录存在
def ensure_upload_dirs():
    os.makedirs('public/avatar', exist_ok=True)
    os.makedirs('public/post_images', exist_ok=True)

# # 创建数据库表和上传目录
# @app.before_first_request
# def create_tables():
#     db.create_all()
#     ensure_upload_dirs()

if __name__ == '__main__':
    ensure_upload_dirs()
    app.run(debug=True, port=5000)